import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

export const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: apiKey,
  temperature: 0.6, 
  maxRetries: 2,
});