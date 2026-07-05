import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import * as z from "zod";

import { searchInternet } from "./internet.service.js";
import { getStockQuote } from "./stockQuote.service.js";

// ==========================================
// 1. TOOL DEFINITIONS
// ==========================================

const stockQuoteTool = tool(
  async ({ ticker }) => {
    const quote = await getStockQuote(ticker);
    return JSON.stringify(quote);
  },
  {
    name: "stockQuoteTool",
    description: "Get EXACT live price of a stock/crypto. Accepts standard tickers (AAPL) or Indian names (TCS.NS, Tata Motors).",
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
    description: "Search the web for news, facts, and recent events. Do NOT use for live stock prices.",
    schema: z.object({
      query: z.string().describe("The search query string"),
      topic: z.enum(["general", "news", "finance"]).optional(),
      timeRange: z.enum(["day", "week", "month", "year"]).optional(),
    }),
  }
);

const tools = [searchInternetTool, stockQuoteTool];

// ==========================================
// 2. MODEL & PROMPT CONFIGURATION
// ==========================================

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0.3, // Lower temperature for more deterministic tool calling
});

const getSystemPrompt = () => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return `You are an elite AI research assistant. TODAY'S DATE IS: ${today}.
  
RULES:
1. ALWAYS use stockQuoteTool for price requests. Format Indian stocks correctly (e.g., TCS.NS).
2. Use bare bracket citations [1] ONLY for searchInternetTool results.
3. If a tool fails to find data, explicitly tell the user. Do not guess numbers.`;
};

const prompt = ChatPromptTemplate.fromMessages([
  ["system", getSystemPrompt()],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
  new MessagesPlaceholder("agent_scratchpad"),
]);

// ==========================================
// 3. AGENT INITIALIZATION
// ==========================================

const agent = createToolCallingAgent({
  llm: mistralModel,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
  maxIterations: 3, // Prevents infinite tool-calling loops
  returnIntermediateSteps: true, // Needed to extract citations from tool outputs
});

// ==========================================
// 4. EXPORTED SERVICES
// ==========================================

export const generateResponse = async (messages) => {
  try {
    const chatHistory = messages
      .filter((msg) => msg.role !== "user" || msg !== messages[messages.length - 1])
      .map((msg) => msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content));
      
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === "user");

    const response = await agentExecutor.invoke({
      input: lastUserMessage.content,
      chat_history: chatHistory,
    });

    // Extract citations elegantly from intermediate tool steps
    const citations = [];
    let citationId = 1;
    const seenUrls = new Set();

    response.intermediateSteps?.forEach((step) => {
      if (step.action.tool === "searchInternetTool") {
        try {
          const results = JSON.parse(step.observation).results || [];
          results.forEach((r) => {
            if (!seenUrls.has(r.url)) {
              seenUrls.add(r.url);
              citations.push({ id: citationId++, title: r.title, url: r.url });
            }
          });
        } catch (e) { /* silent catch for parse errors */ }
      }
    });

    return {
      answer: response.output,
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
      new SystemMessage("Generate a 2-4 word concise, engaging title for this chat. No quotes."),
      new HumanMessage(message),
    ]);
    return response.content.replace(/["']/g, "").trim();
  } catch (error) {
    console.error("Chat Title Generation Error:", error.message);
    return "New Chat"; // Graceful fallback
  }
};
