import YahooFinance from "yahoo-finance2";
import redis from "../config/redis.js";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const CACHE_TTL_SECONDS = 30;

// Isse actual structured price data milta hai — JS-rendered numbers text-crawl
// se nahi milte, isliye search ke bajaye ye dedicated API use karte hain
export const getStockQuote = async (query) => {
  const cacheKey = `stockQuote:${query.trim().toLowerCase()}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (cacheError) {
    console.error("Stock quote cache read error:", cacheError.message);
  }

  try {
    let symbol = query;
    let quote = null;

    try {
      quote = await yahooFinance.quote(symbol);
    } catch {
      quote = null;
    }

    if (!quote || quote.regularMarketPrice == null) {
      const searchResults = await yahooFinance.search(query);
      const bestMatch = searchResults?.quotes?.find(
        (q) => q.symbol && (q.quoteType === "EQUITY" || q.quoteType === "CRYPTOCURRENCY"),
      );

      if (bestMatch?.symbol) {
        symbol = bestMatch.symbol;
        quote = await yahooFinance.quote(symbol);
      }
    }

    if (!quote || quote.regularMarketPrice == null) {
      return { found: false, ticker: query };
    }

    const data = {
      found: true,
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || quote.symbol,
      price: quote.regularMarketPrice,
      currency: quote.currency,
      marketState: quote.marketState,
      asOf: quote.regularMarketTime,
    };

    try {
      await redis.set(cacheKey, JSON.stringify(data), "EX", CACHE_TTL_SECONDS);
    } catch (cacheError) {
      console.error("Stock quote cache write error:", cacheError.message);
    }

    return data;
  } catch (error) {
    console.error("Stock quote error:", error.message);
    return { found: false, ticker: query, error: error.message };
  }
};