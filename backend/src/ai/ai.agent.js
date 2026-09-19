import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "❌ Critical Error: GEMINI_API_KEY is missing from environment variables."
  );
  throw new Error("GEMINI_API_KEY is missing");
}

console.log(`✅ Gemini API Key Loaded: ${apiKey.slice(0, 6)}...`);

const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ✅ FIX 1: Added 'export' here
export const geminiModel = new ChatGoogleGenerativeAI({
  model: modelName,
  apiKey,
  temperature: 0.7,
  maxRetries: 2,
});

// ✅ FIX 2: Renamed to systemPrompt and added 'export'
export const systemPrompt = `
You are KNOW-AI, a helpful AI assistant.

Rules:
- Give clear and accurate answers.
- Understand conversation context.
- Answer directly according to the user's question.
- Give technically correct information.
- If you are unsure, clearly say so.
- Never invent information.
- Keep responses natural, useful, and easy to understand.
- For coding questions, provide working code when appropriate.
`.trim();

// Agent setup (optional to use in your service, but perfectly fine here)
export const agent = createReactAgent({
  llm: geminiModel,
  tools: [],
  prompt: systemPrompt,
});

export default agent;