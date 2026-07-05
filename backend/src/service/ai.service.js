import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import * as z from "zod";

import { searchInternet } from "./internet.service.js";
import { getStockQuote } from "./stockQuote.service.js";

// ==========================================
// 1. TOOL DEFINITIONS
// ==========================================

const stockQuoteTool = tool(
  async ({ ticker }) => {
    // Premium tier restriction check & local Indian stock bypass helper
    const upperTicker = ticker.toUpperCase();
    const isIndianStock = upperTicker.endsWith(".NS") || upperTicker.endsWith(".BSE") || upperTicker === "TCS" || upperTicker.includes("TATA");
    
    if (isIndianStock) {
      return JSON.stringify({ 
        found: false, 
        reason: "PREMIUM_RESTRICTION", 
        message: "Indian exchange assets require premium. Fall back to searchInternetTool for this asset." 
      });
    }

    const quote = await getStockQuote(ticker);
    return JSON.stringify(quote);
  },
  {
    name: "stockQuoteTool",
    description: "Get EXACT live price of US stocks/crypto (e.g., AAPL, BTC/USD). Do NOT use for Indian stocks like TCS or Tata Motors due to API tier restrictions.",
    schema: z.object({
      ticker: z.string().describe("Ticker symbol or company name"),
    }),
  }
);

const searchInternetTool = tool(
  async ({ query, topic, timeRange }) => {
    return await searchInternet(query, { topic, timeRange });
  },
  {
    name: "searchInternetTool",
    description: "Search the web for news, facts, recent events, and live prices of Indian stocks (like TCS stock price today).",
    schema: z.object({
      query: z.string().describe("The search query string"),
      topic: z.enum(["general", "news", "finance"]).optional(),
      timeRange: z.enum(["day", "week", "month", "year"]).optional(),
    }),
  }
);

// Bind tools cleanly directly to the model configuration to avoid buggy package exports
const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0.2,
}).bindTools([searchInternetTool, stockQuoteTool]);

// ==========================================
// 2. STABLE MANUAL RUNTIME LOOP (Production-Ready)
// ==========================================

const getSystemPrompt = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return `You are an elite AI research assistant. TODAY'S DATE IS: ${today}.
  
RULES:
1. For global equities or crypto (AAPL, BTC), use stockQuoteTool.
2. For Indian stocks (TCS, Tata Motors, Reliance), ALWAYS use searchInternetTool because the stock tool lacks Indian exchange licensing. Search explicitly like: "TCS stock price today on NSE".
3. Use bare bracket citations [1] only for facts fetched via searchInternetTool.`;
};

export const generateResponse = async (messages) => {
  try {
    const formattedMessages = [
      new SystemMessage(getSystemPrompt()),
      ...messages.map((msg) => msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content))
    ];

    // First LLM Pass
    let modelResponse = await mistralModel.invoke(formattedMessages);
    const citations = [];
    let citationId = 1;

    // Check if the model wants to call a tool
    if (modelResponse.tool_calls && modelResponse.tool_calls.length > 0) {
      formattedMessages.push(modelResponse); // append assistant's tool intent

      for (const toolCall of modelResponse.tool_calls) {
        let toolResult;
        
        if (toolCall.name === "stockQuoteTool") {
          toolResult = await stockQuoteTool.invoke(toolCall);
          const parsedResult = JSON.parse(toolResult.content);

          // SMART FALLBACK: If Twelve Data hits a premium wall, auto-route to searchInternet!
          if (parsedResult.reason === "PREMIUM_RESTRICTION" || parsedResult.found === false) {
            const fallbackQuery = `current stock price of ${toolCall.args.ticker} yahoo finance`;
            const searchResult = await searchInternet(fallbackQuery, { topic: "finance", timeRange: "day" });
            toolResult = new ToolMessage({
              content: JSON.stringify(searchResult),
              tool_call_id: toolCall.id,
              name: toolCall.name
            });
            
            // Extract citations from the forced search
            searchResult.results?.forEach(r => {
              citations.push({ id: citationId++, title: r.title, url: r.url });
            });
          }
        } else if (toolCall.name === "searchInternetTool") {
          toolResult = await searchInternetTool.invoke(toolCall);
          try {
            const parsed = JSON.parse(toolResult.content);
            parsed.results?.forEach((r) => {
              citations.push({ id: citationId++, title: r.title, url: r.url });
            });
          } catch (e) {}
        }

        formattedMessages.push(toolResult);
      }

      // Second Pass: Generate final response using tool contents
      modelResponse = await mistralModel.invoke(formattedMessages);
    }

    return {
      answer: modelResponse.content,
      citations,
    };
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw error;
  }
};

export const generateChatTitle = async (message) => {
  try {
    const response = await mistralModel.invoke([
      new SystemMessage("Generate a 2-4 word concise title for this chat. No quotes."),
      new HumanMessage(message),
    ]);
    return response.content.replace(/["']/g, "").trim();
  } catch (error) {
    return "New Chat";
  }
};