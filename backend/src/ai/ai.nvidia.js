import dotenv from "dotenv";
dotenv.config();
import { ChatOpenAI } from "@langchain/openai";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error("OPENROUTER_API_KEY is missing");

export const nvidiaModel = new ChatOpenAI({
  modelName: "nvidia/nemotron-3-ultra-550b-a55b:free",
  temperature: 0.2, // Low temperature for high accuracy & quality
  maxRetries: 2,
  maxTokens: 6000, // Lamba output limit table/research ke liye
  openAIApiKey: apiKey,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "KNOW AI",
    }
  }
});