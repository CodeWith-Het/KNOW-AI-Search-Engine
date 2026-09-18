import dotenv from "dotenv";
dotenv.config();

import { ChatGroq } from "@langchain/groq";

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

// ============================================================
// 🎯 STOCK QUOTE TOOL
// ============================================================

const stockQuoteTool = tool(
  async ({ ticker }) => {
    const quote = await getStockQuote(ticker);
    return JSON.stringify(quote);
  },
  {
    name: "stockQuoteTool",

    description:
      "Use this to get the EXACT live price of ANY stock (including US, Indian NSE/BSE, and Global markets), index, or cryptocurrency. You can pass a ticker symbol (e.g. 'AAPL', 'RELIANCE.NS', 'BTC/USD') OR just the plain company name (e.g. 'Tata Motors', 'Apple'). The tool will automatically resolve plain names to the correct ticker. ALWAYS use this instead of searchInternetTool whenever the user asks for ANY stock or crypto price.",

    schema: z.object({
      ticker: z
        .string()
        .describe(
          "A ticker symbol OR a plain company name, e.g. 'AAPL', 'RELIANCE.NS', 'Tata Motors', or 'BTC/USD'"
        ),
    }),
  }
);

// ============================================================
// 🎯 INTERNET SEARCH TOOL
// ============================================================

const searchInternetTool = tool(
  async ({ query, topic, timeRange }) => {
    return await searchInternet(query, {
      topic,
      timeRange,
    });
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
  }
);

// ============================================================
// 🤖 GROQ MODELS
// ============================================================

// Main AI model
const groqModel = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.7,
});

// Small/Fast model for chat title
const titleModel = new ChatGroq({
  model: "openai/gpt-oss-20b",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.3,
});


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error) =>
  error?.status === 429 ||
  error?.response?.status === 429 ||
  /rate.?limit/i.test(error?.message || "");

const withRetry = async (fn, { retries = 1, delayMs = 1500 } = {}) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && isRateLimitError(error)) {
      await sleep(delayMs);
      return withRetry(fn, { retries: retries - 1, delayMs });
    }
    throw error;
  }
};

// ============================================================
// 🧠 SYSTEM PROMPT
// ============================================================

const getSystemPrompt = () => {
  const now = new Date();

  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTimeIST = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

  return `You are a smart AI research agent.

TODAY'S DATE IS: ${today}.
CURRENT TIME IN INDIA (IST) IS: ${currentTimeIST}.

If the user asks for the current date or time, use THESE EXACT VALUES directly.

NEVER guess, estimate, or calculate the time yourself — always state precisely what is given above.

If the user asks for time in a different timezone, convert mathematically from this IST value, don't guess a new one.

You have access to two tools:

1. stockQuoteTool
2. searchInternetTool


CITATION RULES — follow these exactly:

1. Only add citation markers for facts that came from searchInternetTool — NEVER add a [n] marker for information from stockQuoteTool, since it has no separate source link to point to. Just state the price directly without any bracket marker.

2. When you use information from a search result, cite it using a BARE bracket marker like [1], [2], [3] — numbered in the exact order the sources appear within that search call's results.

3. NEVER write a markdown link for a citation (e.g. never write "[1](https://...)"). Only the bare "[1]" marker — no parentheses, no URL, no title next to it.

4. Do NOT write your own "Sources", "References", or "Citations" section at the end of your answer. The application already displays a separate sources list — do not duplicate it in your answer text.

5. Only state a specific fact or number if it is EXPLICITLY present in the tool result content you received. NEVER estimate, guess, or recall a number from your own training data and present it as current — if the tool results don't contain the exact figure, say plainly that you couldn't find it.

6. If you don't use searchInternetTool at all, don't add any citation markers.


TOOL ROUTING RULES:

- For ANY stock (including Indian stocks like NSE/BSE), index, or cryptocurrency price question, ALWAYS use stockQuoteTool.

- You can send plain company names (e.g., "Tata Motors") or tickers (e.g., "RELIANCE.NS").

- Never use searchInternetTool for live prices — search snippets often don't contain the actual live number.

- If the user asks for a price in a currency different from the instrument's native currency (e.g. the user wants a USD-priced asset shown in INR), do this in two tool calls:
  first get the native price (e.g. "BTC/USD"),
  then get the live exchange rate using a forex pair (e.g. "USD/INR") via the SAME stockQuoteTool.

- Multiply them yourself to get the converted value.

- NEVER use an exchange rate from your own memory/training data — it will be outdated.

- If you can't get a live exchange rate, say so instead of guessing one.

- If stockQuoteTool returns { found: false }, tell the user plainly you couldn't fetch that price — do not fall back to guessing a number.

- For breaking news, facts, or anything else needing current information, use searchInternetTool.


SEARCH QUERY QUALITY RULES:

- Make search queries specific, not vague.

- A vague query like "latest information of Google CEO" returns noisy, unrelated results.

- Instead search for something concrete such as:
  "Sundar Pichai latest statement announcement"
  or
  "Google CEO latest news".

- After getting search results, check whether they actually address the user's question.

- If the results are clearly off-topic or unrelated to what was asked, do not present them as the answer.

- Say you couldn't find directly relevant information, or try one more, more specific search query before giving up.

- Never treat a search result as relevant just because it superficially mentions a matching name/keyword.


RESPONSE FORMATTING RULES:

1. Structure multi-part answers like a research brief: a short 1-2 sentence direct answer first, then organized details below — never one giant run-on paragraph.

2. When listing multiple items, ALWAYS use proper markdown list syntax.

3. Bold the key subject of each point using **bold**, so the answer is scannable at a glance.

4. If the topic naturally splits into sections, use a short markdown heading for each section.

5. Keep paragraphs short — 2-3 sentences max per paragraph.

6. Never merge two separate answers/topics together without a clear visual break.`;
};

// ============================================================
// 🎯 AGENT
// ============================================================

const agent = createAgent({
  model: groqModel,

  tools: [
    searchInternetTool,
    stockQuoteTool,
  ],

  systemPrompt: getSystemPrompt(),
});

// ============================================================
// 🧹 CONTENT NORMALIZER
// ============================================================

const normalizeContent = (content) => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((block) =>
        typeof block === "string"
          ? block
          : block?.text || ""
      )
      .join("");
  }

  if (content && typeof content === "object") {
    return content.text || "";
  }

  return String(content ?? "");
};

// ============================================================
// 💬 NORMAL RESPONSE
// ============================================================

export const generateResponse = async (messages) => {
  try {
    const response = await agent.invoke({
      systemPrompt: getSystemPrompt(),

      messages: messages
        .map((msg) => {
          const content = normalizeContent(msg.content);

          // Skip empty AI messages
          if (msg.role === "ai" && !content.trim()) {
            return null;
          }

          if (msg.role === "user") {
            return new HumanMessage(content);
          }

          if (msg.role === "ai") {
            return new AIMessage(content);
          }

          return null;
        })
        .filter(Boolean),
    });

    // Find final AI message
    const finalMessage = [...response.messages]
      .reverse()
      .find((msg) => normalizeContent(msg.content).trim());

    // ========================================================
    // 📚 EXTRACT CITATIONS
    // ========================================================

    const citations = [];
    const seenUrls = new Set();
    let citationId = 1;

    for (const msg of response.messages) {
      const isSearchToolResult =
        msg instanceof ToolMessage &&
        msg.name === "searchInternetTool";

      if (!isSearchToolResult) {
        continue;
      }

      try {
        const parsed = JSON.parse(msg.content);

        const results = parsed.results || [];

        for (const r of results) {
          if (seenUrls.has(r.url)) {
            continue;
          }

          seenUrls.add(r.url);

          citations.push({
            id: citationId++,
            title: r.title,
            url: r.url,
          });
        }
      } catch (parseError) {
        console.error(
          "Citation parse error:",
          parseError.message
        );
      }
    }

    return {
      answer: normalizeContent(finalMessage?.content),
      citations,
    };

  } catch (error) {
    console.error(
      "Groq AI Error:",
      error.message
    );

    throw error;
  }
};

// ============================================================
// ⚡ STREAMING RESPONSE
// ============================================================

export const streamAgentResponse = async (
  messages,
  onToken,
  onStatus
) => {
  try {
    const eventStream = await agent.streamEvents(
      {
        systemPrompt: getSystemPrompt(),

        messages: messages
          .map((msg) => {
            const content = normalizeContent(msg.content);

            if (msg.role === "ai" && !content.trim()) {
              return null;
            }

            if (msg.role === "user") {
              return new HumanMessage(content);
            }

            if (msg.role === "ai") {
              return new AIMessage(content);
            }

            return null;
          })
          .filter(Boolean),
      },

      {
        version: "v2",
      }
    );

    let fullAnswer = "";

    const citations = [];
    const seenUrls = new Set();
    let citationId = 1;

    for await (const event of eventStream) {

      // ======================================================
      // 🔧 TOOL START STATUS
      // ======================================================

      if (event.event === "on_tool_start") {
        onStatus?.(event.name);
      }

      // ======================================================
      // 💬 AI STREAM
      // ======================================================

      if (event.event === "on_chat_model_stream") {
        const token = normalizeContent(
          event.data?.chunk?.content
        );

        if (token) {
          fullAnswer += token;

          onToken?.(token);
        }
      }

      // ======================================================
      // 📚 SEARCH CITATIONS
      // ======================================================

      if (
        event.event === "on_tool_end" &&
        event.name === "searchInternetTool"
      ) {
        try {
          const output =
            event.data?.output?.content ??
            event.data?.output;

          const parsed =
            typeof output === "string"
              ? JSON.parse(output)
              : output;

          const results = parsed?.results || [];

          for (const r of results) {
            if (seenUrls.has(r.url)) {
              continue;
            }

            seenUrls.add(r.url);

            citations.push({
              id: citationId++,
              title: r.title,
              url: r.url,
            });
          }

        } catch (parseError) {
          console.error(
            "Streaming citation parse error:",
            parseError.message
          );
        }
      }
    }

    return {
      fullAnswer: normalizeContent(fullAnswer),
      citations,
    };

  } catch (error) {
    console.error(
      "Streaming agent error:",
      error.message
    );

    throw error;
  }
};

// ============================================================
// 🏷️ CHAT TITLE GENERATOR
// ============================================================

export const generateChatTitle = async (message) => {
  try {
    const response = await withRetry(() =>
      titleModel.invoke([
        new SystemMessage(
          `You are a helpful assistant that generates concise and descriptive titles for chat conversations.

The user will provide you with the first message of a chat conversation.

Generate a title that captures the essence of the conversation in 2-4 words.

The title should be:
- Clear
- Relevant
- Short
- Engaging
- Easy to understand

Return ONLY the title.
Do not add quotes.
Do not add explanation.
Do not add punctuation.`
        ),

        new HumanMessage(
          `Generate a title for a chat conversation based on the following first message:

${message}`
        ),
      ])
    );

    const cleanTitle = normalizeContent(response.content)
      .replace(/["']/g, "")
      .replace(/\s+/g, " ")
      .trim();

    return (
      cleanTitle ||
      message
        .trim()
        .split(/\s+/)
        .slice(0, 5)
        .join(" ")
    );

  } catch (error) {
    console.error(
      "Title Generation Error:",
      error.message
    );

    return message
      .trim()
      .split(/\s+/)
      .slice(0, 5)
      .join(" ");
  }
};