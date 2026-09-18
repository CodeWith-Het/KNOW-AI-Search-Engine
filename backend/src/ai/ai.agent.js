import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.7,
});

const agent = createAgent({
  model: geminiModel,
  tools: [],
  systemPrompt: `
You are KNOW-AI, a helpful AI assistant.

Rules:
- Give clear and accurate answers.
- Understand the conversation context.
- Answer according to the user's question.
- If you are unsure, clearly say so.
- Do not invent information.
- Keep responses natural and helpful.
`,
});

export default agent;