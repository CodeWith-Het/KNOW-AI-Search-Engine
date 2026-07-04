import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import readline from "readline/promises";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import * as z from "zod";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
import { searchInternet } from "./internet.service.js";
import { getStockQuote } from "./stockQuote.service.js";

const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 🎯 Stock/Crypto Quote Tool — exact live number, JS-rendered price ka
// text-search se milna reliable nahi hota, isliye alag dedicated tool
const stockQuoteTool = tool(
  async ({ ticker }) => {
    const quote = await getStockQuote(ticker);
    return JSON.stringify(quote);
  },
  {
    name: "stockQuoteTool",
    description:
      "Use this to get the EXACT live price of a stock, index, or cryptocurrency. You can pass a ticker symbol (e.g. 'AAPL', 'BTC/USD', 'TATAMOTORS') or just the plain company name (e.g. 'Tata Motors', 'Apple') — this tool will auto-resolve the correct current ticker even if the company recently renamed or demerged. ALWAYS use this instead of searchInternetTool whenever the user asks for a stock/crypto/index price.",
    schema: z.object({
      ticker: z
        .string()
        .describe(
          "A ticker symbol OR a plain company name, e.g. 'AAPL', 'BTC/USD', or 'Tata Motors'",
        ),
    }),
  },
);
// 🎯 Search Tool — general web search, NOT for exact prices anymore
const searchInternetTool = tool(
  async ({ query, topic, timeRange }) => {
    return await searchInternet(query, { topic, timeRange });
  },
  {
    name: "searchInternetTool",
    description:
      "Use this tool for general web search — news, facts, current events. Do NOT use this for stock/crypto/index prices, use stockQuoteTool instead since it gives an exact number. Set topic to 'news' for current events, or leave as 'general' otherwise. Set timeRange to 'day' when the user needs today's exact context, or 'week'/'month' for broader recent context.",
    schema: z.object({
      query: z.string().describe("The search query string"),
      topic: z
        .enum(["general", "news", "finance"])
        .optional()
        .describe("Search category"),
      timeRange: z
        .enum(["day", "week", "month", "year"])
        .optional()
        .describe("How recent the results should be"),
    }),
  },
);

// 🎯 model
const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

const mistraAiModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// Citation instructions ab system prompt ka hissa hain
const AGENT_SYSTEM_PROMPT = `You are a smart AI research agent. You have one main power: you can search
the internet using the search tool to research any latest topic. Use it wisely based on user requests.

CITATION RULES — follow these exactly:
1. Only add citation markers for facts that came from searchInternetTool — NEVER add a [n] marker for
   information from stockQuoteTool, since it has no separate source link to point to. Just state the
   price directly without any bracket marker.
2. When you use information from a search result, cite it using a BARE bracket marker like [1], [2], [3] —
   numbered in the exact order the sources appear within that search call's results.
3. NEVER write a markdown link for a citation (e.g. never write "[1](https://...)"). Only the bare
   "[1]" marker — no parentheses, no URL, no title next to it.
4. Do NOT write your own "Sources", "References", or "Citations" section at the end of your answer.
   The application already displays a separate sources list — do not duplicate it in your answer text.
5. Only state a specific fact or number if it is EXPLICITLY present in the tool result content you
   received. NEVER estimate, guess, or recall a number from your own training data and present it as
   current — if the tool results don't contain the exact figure, say plainly that you couldn't find it.
6. If you don't use searchInternetTool at all, don't add any citation markers.

TOOL ROUTING RULES:
- For ANY stock, index, or cryptocurrency price question, use stockQuoteTool with the correct ticker
  symbol (e.g. "TATAMOTORS.NS", "BTC-USD", "AAPL"). Never use searchInternetTool for prices — search
  snippets often don't contain the actual live number even when they look relevant.
- If the user asks for a price in a currency different from the instrument's native currency (e.g. the
  user wants a USD-priced asset shown in INR), do this in two tool calls: first get the native price
  (e.g. "BTC/USD"), then get the live exchange rate using a forex pair (e.g. "USD/INR") via the SAME
  stockQuoteTool. Multiply them yourself to get the converted value. NEVER use an exchange rate from
  your own memory/training data — it will be outdated. If you can't get a live exchange rate, say so
  instead of guessing one.
- If stockQuoteTool returns { found: false }, tell the user plainly you couldn't fetch that price —
  do not fall back to guessing a number.
- For breaking news, facts, or anything else needing current information, use searchInternetTool.`;

// 🎯 Agent
const agent = createAgent({
  model: mistraAiModel,
  tools: [searchInternetTool, stockQuoteTool],
  systemPrompt: AGENT_SYSTEM_PROMPT,
});

// Content kabhi kabhi array-of-blocks ya object ban ke aata hai (LangChain
// multi-part content). Mistral sirf plain string / text-block accept karta
// hai, isliye har jagah pehle isse normalize karte hain
const normalizeContent = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) =>
        typeof block === "string" ? block : block?.text || "",
      )
      .join("");
  }
  if (content && typeof content === "object") {
    return content.text || JSON.stringify(content);
  }
  return String(content ?? "");
};

export const generateResponse = async (messages) => {
  try {
    const response = await agent.invoke({
      systemPrompt: AGENT_SYSTEM_PROMPT,
      messages: messages
        .map((msg) => {
          const content = normalizeContent(msg.content);
          if (msg.role === "user") return new HumanMessage(content);
          if (msg.role === "ai") return new AIMessage(content);
          return null;
        })
        .filter(Boolean),
    });

    const finalMessage = response.messages[response.messages.length - 1];

    // Agent ne jitni bhi baar search tool call kiya, un sabke results
    // se citations nikaal ke sequential IDs de do (same URL dobara na aaye)
    const citations = [];
    const seenUrls = new Set();
    let citationId = 1;

    for (const msg of response.messages) {
      const isSearchToolResult =
        msg instanceof ToolMessage && msg.name === "searchInternetTool";

      if (!isSearchToolResult) continue;

      try {
        const parsed = JSON.parse(msg.content);
        const results = parsed.results || [];
        for (const r of results) {
          if (seenUrls.has(r.url)) continue;
          seenUrls.add(r.url);
          citations.push({
            id: citationId++,
            title: r.title,
            url: r.url,
          });
        }
      } catch (parseError) {
        console.error("Citation parse error:", parseError.message);
      }
    }

    return {
      answer: normalizeContent(finalMessage.content),
      citations,
    };
  } catch (error) {
    console.error("gemini Ai Error:", error.message);
    throw error;
  }
};

export const generateChatTitle = async (message) => {
  try {
    const response = await mistraAiModel.invoke([
      new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for chat conversations
      
      User will provide you with the first message of a chat conversation, and you will generate a title that captures 
      the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving
      users a quick understanding of the chat's topic.
      `),
      new HumanMessage(
        `Generate a title for a chat conversation based on the following first message:${message}`,
      ),
    ]);
    let cleanTitle = response.content.replace(/["']/g, "").trim();

    return cleanTitle;
  } catch (error) {
    console.error("Mistral Ai Error:", error.message);
    throw error;
  }
};