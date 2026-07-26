import { tavily as Tavily } from "@tavily/core";

const tavily = Tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export const searchInternet = async (query, options = {}) => {
  try {
    const result = await tavily.search(query, {
      maxResults: 3,
      searchDepth: "advanced",
      // 👇 agent ab per-query decide karega ye dono, defaults fallback hain
      topic: options.topic || "general",
      timeRange: options.timeRange || "week",
    });

    return JSON.stringify(result);
  } catch (error) {
    console.error("Error searching Tavily:", error);
    throw error;
  }
};