import axios from "axios";
import redis from "../config/redis.js";

const BASE_URL = "https://api.twelvedata.com";
const CACHE_TTL_SECONDS = 30;

const fetchQuote = async (symbol, exchange) => {
  const params = {
    symbol,
    apikey: process.env.TWELVE_DATA_API_KEY,
  };
  if (exchange) params.exchange = exchange;

  try {
    const { data } = await axios.get(`${BASE_URL}/quote`, {
      params,
      timeout: 8000,
    });

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

// Agar direct symbol se quote na mile, Twelve Data ke apne symbol search
// se sahi symbol/exchange resolve karo (jaisa Tata Motors demerger case tha)
const resolveSymbol = async (query) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/symbol_search`, {
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
// kabhi kabhi galat/buggy data dete hain. Isliye unpe bharosa nahi karte —
// hamesha USD ke through khud recompute karte hain (base/USD * USD/target)
const recomputeViaUsd = async (quote) => {
  if (quote.exchange !== "Synthetic") return quote;

  const pair = parsePair(quote.symbol);
  if (!pair || pair.quoteCurrency === "USD") return quote;

  const usdQuote = await fetchQuote(`${pair.base}/USD`);
  const fxQuote = await fetchQuote(`USD/${pair.quoteCurrency}`);

  if (!usdQuote || !fxQuote) return quote; // fallback: original (possibly wrong) value

  const recomputedPrice = parseFloat(usdQuote.close) * parseFloat(fxQuote.close);
  return { ...quote, close: recomputedPrice.toFixed(2), recomputed: true };
};

export const getStockQuote = async (query) => {
  const cacheKey = `stockQuote:${query.trim().toLowerCase()}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (cacheError) {
    console.error("Stock quote cache read error:", cacheError.message);
  }

  try {
    let quote = await fetchQuote(query);

    if (!quote) {
      const resolved = await resolveSymbol(query);
      if (resolved) {
        quote = await fetchQuote(resolved.symbol, resolved.exchange);
      }
    }

    if (!quote) {
      return { found: false, ticker: query };
    }

    quote = await recomputeViaUsd(quote);

    const result = {
      found: true,
      symbol: quote.symbol,
      name: quote.name,
      price: parseFloat(quote.close),
      currency: quote.currency,
      exchange: quote.exchange,
      asOf: quote.datetime,
    };

    try {
      await redis.set(cacheKey, JSON.stringify(result), "EX", CACHE_TTL_SECONDS);
    } catch (cacheError) {
      console.error("Stock quote cache write error:", cacheError.message);
    }

    return result;
  } catch (error) {
    console.error("Stock quote error:", error.message);
    return { found: false, ticker: query, error: error.message };
  }
};