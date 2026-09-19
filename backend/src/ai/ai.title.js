import dotenv from "dotenv";
dotenv.config();
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing in .env");
}

// Title ke liye low temperature = accurate & precise output
const titleModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.3,
  apiKey,
  maxRetries: 2,
});

export const generateChatTitle = async (userMessage) => {
  try {
    const prompt = `
Generate a short and meaningful title for a chat based ONLY on the user's first message.

User's first message:
"${userMessage}"

Rules:
- Maximum 6 words.
- Return only the title.
- Do not use quotation marks.
- Do not add explanations.
- Do not use emojis.
`;

    const response = await titleModel.invoke(prompt);
    
    // Response se direct string nikal kar clean karna
    const title = response.content.toString().trim().replace(/^["']|["']$/g, "");
    
    return title.slice(0, 80) || "New Chat";
  } catch (error) {
    console.error("❌ Chat title generation failed:", error.message);
    return "New Chat"; // Fallback agar API fail ho jaye
  }
};