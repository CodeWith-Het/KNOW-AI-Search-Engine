import axios from "axios";
import redis from "../config/redis.js";

const TWELVE_DATA_BASE = "https://api.twelvedata.com";
const INDIAN_API_BASE = "https://stock.indianapi.in";
const CACHE_TTL_SECONDS = 30;

// ==========================================================
// 🔵 ENGINE 1: TWELVE DATA — Global stocks, forex, crypto
// ==========================================================
const fetchTwelveDataQuote = async (symbol, exchange) => {
  const params = { symbol, apikey: process.env.TWELVE_DATA_API_KEY };
  if (exchange) params.exchange = exchange;

  try {
    const { data } = await axios.get(`${TWELVE_DATA_BASE}/quote`, {
      params,
      timeout: 8000,
    });
    // Twelve Data ka free tier Indian stocks ke liye kabhi "fake 200 OK error"
    // deta hai — dono cases mein null return karo taaki Indian API engine try ho
    if (!data || data.status === "error" || !data.close) return null;
    return data;
  } catch (error) {
    console.error(
      "Twelve Data /quote error:",
      symbol,
      error.response?.data?.message || error.message,
    );
    return null;
  }
};

const resolveTwelveDataSymbol = async (query) => {
  try {
    const { data } = await axios.get(`${TWELVE_DATA_BASE}/symbol_search`, {
      params: { symbol: query, apikey: process.env.TWELVE_DATA_API_KEY },
      timeout: 8000,
    });
    const bestMatch = data?.data?.[0];
    return bestMatch
      ? { symbol: bestMatch.symbol, exchange: bestMatch.exchange }
      : null;
  } catch (error) {
    console.error(
      "Twelve Data /symbol_search error:",
      query,
      error.response?.data?.message || error.message,
    );
    return null;
  }
};

// "BTC/USD" jaisa symbol tod ke { base: "BTC", quoteCurrency: "USD" } deta hai
const parsePair = (symbol) => {
  const match = symbol?.match(/^([A-Za-z0-9.]+)\/([A-Za-z]{3})$/);
  return match ? { base: match[1], quoteCurrency: match[2].toUpperCase() } : null;
};

// Twelve Data ke "Synthetic" exchange wale cross-currency pairs (jaise BTC/INR)
// kabhi kabhi galat/buggy data dete hain — isliye hamesha USD ke through
// khud recompute karte hain (base/USD * USD/target)
const recomputeViaUsd = async (quote) => {
  if (quote.exchange !== "Synthetic") return quote;

  const pair = parsePair(quote.symbol);
  if (!pair || pair.quoteCurrency === "USD") return quote;

  const usdQuote = await fetchTwelveDataQuote(`${pair.base}/USD`);
  const fxQuote = await fetchTwelveDataQuote(`USD/${pair.quoteCurrency}`);

  if (!usdQuote || !fxQuote) return quote;

  const recomputedPrice = parseFloat(usdQuote.close) * parseFloat(fxQuote.close);
  return { ...quote, close: recomputedPrice.toFixed(2), recomputed: true };
};

// ==========================================================
// 🟠 ENGINE 2: INDIAN API (indianapi.in) — NSE/BSE stocks
// Yahoo Finance ki jagah — API-key based hai, cloud IPs block
// nahi karta (jo Yahoo scraping-based library ke saath hota tha)
// ==========================================================
// Agar direct ticker/name match na mile, IndianAPI ke apne industry_search
// se sahi "common name" dhoondh lo (jaise "TATAMOTORS" -> "Tata Motors")
const resolveIndianStockName = async (query) => {
  try {
    const { data } = await axios.get(`${INDIAN_API_BASE}/industry_search`, {
      params: { query },
      headers: { "x-api-key": process.env.INDIAN_API_KEY },
      timeout: 8000,
    });
    const bestMatch = Array.isArray(data) ? data[0] : null;
    return bestMatch?.commonName || null;
  } catch (error) {
    console.error(
      "IndianAPI /industry_search error:",
      query,
      error.response?.data?.message || error.message,
    );
    return null;
  }
};

const fetchIndianStockQuote = async (rawQuery) => {
  // IndianAPI plain company names expect karta hai ("Tata Motors"), tickers
  // ke exchange-suffix (.NS, .BO, .NSE, .BSE) nahi — strip kar do taaki
  // agent chahe "TATAMOTORS.NS" bheje ya "Tata Motors", dono kaam karein
  const query = rawQuery.replace(/\.(NS|BO|NSE|BSE)$/i, "").trim();

  const tryFetch = async (name) => {
    const { data } = await axios.get(`${INDIAN_API_BASE}/stock`, {
      params: { name },
      headers: { "x-api-key": process.env.INDIAN_API_KEY },
      timeout: 8000,
    });
    if (!data || data.error || !data.currentPrice) return null;
    return data;
  };

  try {
    let data = await tryFetch(query);

    // Agar direct match na mila (jaise raw ticker code diya gaya company
    // naam ke bajaye), industry_search se sahi common name dhoondh ke retry karo
    if (!data) {
      const resolvedName = await resolveIndianStockName(query);
      if (resolvedName) {
        data = await tryFetch(resolvedName);
      }
    }

    // 🔍 TEMPORARY DEBUG
    console.log("=== INDIAN API RESULT ===");
    console.log("Original:", rawQuery, "| Cleaned:", query);
    console.log(data ? JSON.stringify(data).slice(0, 500) : "null (not found even after fallback)");
    console.log("=== END ===");

    if (!data) return null;

    // API dono exchanges ka price ek saath deta hai — NSE ko prefer karo,
    // warna BSE fallback
    const nsePrice = data.currentPrice.NSE;
    const bsePrice = data.currentPrice.BSE;
    const price = nsePrice ?? bsePrice;

    if (price == null) return null;

    return {
      found: true,
      symbol: data.tickerId,
      name: data.companyName,
      price: parseFloat(price),
      currency: "INR",
      exchange: nsePrice != null ? "NSE" : "BSE",
      asOf: new Date().toISOString(),
      source: "IndianAPI",
    };
  } catch (error) {
    console.error(
      "IndianAPI /stock error:",
      query,
      error.response?.data?.message || error.message,
    );
    return null;
  }
};

// ==========================================================
// 🚀 MAIN EXPORT — Hybrid router: pehle Twelve Data (global),
// fail ho to IndianAPI (Indian NSE/BSE stocks)
// ==========================================================
export const getStockQuote = async (query) => {
  const cacheKey = `stockQuote:${query.trim().toLowerCase().replace(/\s+/g, "_")}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (cacheError) {
    console.error("Stock quote cache read error:", cacheError.message);
  }

  let finalResult = null;

  // 1) Global stocks / crypto / forex — Twelve Data
  let tdQuote = await fetchTwelveDataQuote(query);
  if (!tdQuote) {
    const resolved = await resolveTwelveDataSymbol(query);
    if (resolved) {
      tdQuote = await fetchTwelveDataQuote(resolved.symbol, resolved.exchange);
    }
  }

  if (tdQuote) {
    tdQuote = await recomputeViaUsd(tdQuote);
    finalResult = {
      found: true,
      symbol: tdQuote.symbol,
      name: tdQuote.name,
      price: parseFloat(tdQuote.close),
      currency: tdQuote.currency,
      exchange: tdQuote.exchange,
      asOf: tdQuote.datetime,
      source: "Twelve Data",
    };
  } else {
    // 2) Twelve Data fail hua (common for Indian stocks on free tier) —
    // IndianAPI try karo
    finalResult = await fetchIndianStockQuote(query);
  }

  if (!finalResult) {
    return { found: false, ticker: query };
  }

  try {
    await redis.set(cacheKey, JSON.stringify(finalResult), "EX", CACHE_TTL_SECONDS);
  } catch (cacheError) {
    console.error("Stock quote cache write error:", cacheError.message);
  }

  return finalResult;
};