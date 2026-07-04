import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export const getStockQuote = async (query) => {
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

    return {
      found: true,
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || quote.symbol,
      price: quote.regularMarketPrice,
      currency: quote.currency,
      marketState: quote.marketState,
      asOf: quote.regularMarketTime,
    };
  } catch (error) {
    console.error("Stock quote error:", error.message);
    return { found: false, ticker: query, error: error.message };
  }
};