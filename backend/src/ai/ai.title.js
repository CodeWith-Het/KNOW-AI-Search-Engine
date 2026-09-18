import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.3,
  apiKey: process.env.GOOGLE_API_KEY,
});

export const generateChatTitle = async (userMessage) => {
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

  const response = await geminiModel.invoke(prompt);

  return response.content.toString().trim();
};