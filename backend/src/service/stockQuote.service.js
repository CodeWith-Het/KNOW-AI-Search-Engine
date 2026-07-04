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

  const { data } = await axios.get(`${BASE_URL}/quote`, {
    params,
    timeout: 8000,
  });

  // Twelve Data error responses look like { code, message, status: "error" }
  if (!data || data.status === "error" || !data.close) return null;
  return data;
};

// Agar direct symbol se quote na mile, Twelve Data ke apne symbol search
// se sahi symbol/exchange resolve karo (jaisa Tata Motors demerger case tha)
const resolveSymbol = async (query) => {
  const { data } = await axios.get(`${BASE_URL}/symbol_search`, {
    params: { symbol: query, apikey: process.env.TWELVE_DATA_API_KEY },
    timeout: 8000,
  });

  const bestMatch = data?.data?.[0];
  return bestMatch
    ? { symbol: bestMatch.symbol, exchange: bestMatch.exchange }
    : null;
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