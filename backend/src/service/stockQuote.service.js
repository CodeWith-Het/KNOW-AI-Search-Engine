import axios from "axios";
import YahooFinance from "yahoo-finance2"; // 👈 Version 3 ka naya import style
import redis from "../config/redis.js";

// 👈 Version 3 ke liye initialization zaroori hai
const yahooFinance = new YahooFinance(); 

const BASE_URL = "https://api.twelvedata.com";
const CACHE_TTL_SECONDS = 30;

// ==========================================
// 🔴 ENGINE 1: TWELVE DATA (For Crypto, Forex, US Stocks)
// ==========================================
const fetchTwelveDataQuote = async (symbol, exchange) => {
  const params = {
    symbol,
    apikey: process.env.TWELVE_DATA_API_KEY,
  };
  if (exchange) params.exchange = exchange;

  try {
    const { data } = await axios.get(`${BASE_URL}/quote`, { params, timeout: 8000 });
    // Handle Twelve Data's Fake 200 OK error for Indian/Premium stocks
    if (data && data.status === "error") {
      console.log(`⚠️ Twelve Data bypass: ${data.message}`);
      return null;
    }
    if (!data || !data.close) return null;
    return data;
  } catch (error) {
    return null;
  }
};

const resolveTwelveDataSymbol = async (query) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/symbol_search`, {
      params: { symbol: query, apikey: process.env.TWELVE_DATA_API_KEY },
      timeout: 8000,
    });
    const bestMatch = data?.data?.[0];
    return bestMatch ? { symbol: bestMatch.symbol, exchange: bestMatch.exchange } : null;
  } catch (error) {
    return null;
  }
};

const parsePair = (symbol) => {
  const match = symbol?.match(/^([A-Za-z0-9.]+)\/([A-Za-z]{3})$/);
  return match ? { base: match[1], quoteCurrency: match[2].toUpperCase() } : null;
};

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

// ==========================================
// 🔵 ENGINE 2: YAHOO FINANCE (Fallback for Indian Stocks)
// ==========================================
const fetchYahooQuote = async (query) => {
  let ticker = query.trim().toUpperCase();
  console.log(`🔄 Switching to Yahoo Finance Engine for: ${ticker}`);
  
  try {
    let quote = null;

    // 1. Try Direct
    try {
      quote = await yahooFinance.quote(ticker);
    } catch (e) {
      console.error(`⚠️ Yahoo Direct Error [${ticker}]:`, e.message);
    }

    // 2. Try with .NS (Indian Fallback)
    if (!quote && !ticker.endsWith('.NS') && !ticker.endsWith('.BO')) {
      try {
        console.log(`🔄 Trying Yahoo with .NS suffix: ${ticker}.NS`);
        quote = await yahooFinance.quote(`${ticker}.NS`);
      } catch (e) {
        console.error(`⚠️ Yahoo .NS Error [${ticker}.NS]:`, e.message);
      }
    }

    // 3. Try Search (Agar direct name "Tata Motors" ya "TCS" bheja ho)
    if (!quote) {
      try {
        console.log(`🔄 Searching Yahoo for name: ${query}`);
        const searchResult = await yahooFinance.search(query);
        if (searchResult && searchResult.quotes && searchResult.quotes.length > 0) {
          ticker = searchResult.quotes[0].symbol;
          console.log(`🎯 Yahoo Search Found Ticker: ${ticker}`);
          quote = await yahooFinance.quote(ticker);
        }
      } catch (e) {
        console.error(`⚠️ Yahoo Search Error [${query}]:`, e.message);
      }
    }

    if (quote && quote.regularMarketPrice) {
      return {
        symbol: quote.symbol,
        name: quote.shortName || quote.longName,
        price: quote.regularMarketPrice,
        currency: quote.currency,
        exchange: quote.fullExchangeName,
        asOf: new Date(quote.regularMarketTime).toISOString(),
        source: "Yahoo Finance"
      };
    }
    return null;
  } catch (error) {
    console.error(`❌ Fatal Yahoo Engine Error:`, error.message);
    return null;
  }
};

// ==========================================
// 🚀 MAIN EXPORT (The Hybrid Router)
// ==========================================
export const getStockQuote = async (query) => {
  const cacheKey = `stockQuote:${query.trim().toLowerCase().replace(/\s+/g, '_')}`;

  // 1. Check Redis Cache
  try {
    if (redis && redis.isReady !== false) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`✅ Cache Hit for: ${query}`);
        return JSON.parse(cached);
      }
    }
  } catch (cacheError) {
    console.error("⚠️ Redis offline/error, skipping cache:", cacheError.message);
  }

  // 2. Try Twelve Data Engine First
  let finalResult = null;
  let tdQuote = await fetchTwelveDataQuote(query);
  
  if (!tdQuote) {
    const resolved = await resolveTwelveDataSymbol(query);
    if (resolved) tdQuote = await fetchTwelveDataQuote(resolved.symbol, resolved.exchange);
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
      source: "Twelve Data"
    };
  } else {
    // 3. If Twelve Data Fails (e.g., Indian Stocks), Fire Yahoo Finance Engine
    const yahooQuote = await fetchYahooQuote(query);
    if (yahooQuote) {
      finalResult = { found: true, ...yahooQuote };
    }
  }

  // 4. Return Data or Error
  if (!finalResult) {
    console.log(`❌ Both Engines Failed. No pricing data found for ${query}`);
    return { found: false, ticker: query };
  }

  // 5. Save to Redis Cache
  try {
    if (redis && redis.isReady !== false) {
      await redis.set(cacheKey, JSON.stringify(finalResult), "EX", CACHE_TTL_SECONDS);
    }
  } catch (cacheError) {
    console.error("⚠️ Cache write error:", cacheError.message);
  }

  return finalResult;
};