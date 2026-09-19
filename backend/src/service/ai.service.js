import {  geminiModel, systemPrompt,  } from "../ai/ai.agent.js";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { generateChatTitle } from "../ai/ai.title.js";

const contentToText = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((item) => (typeof item === "string" ? item : item?.text || "")).join("");
  }
  return String(content ?? "");
};

export const generateAIResponse = async (messages) => {
  try {
    // Format messages for Langchain Core
    const formattedMessages = [
      new SystemMessage(systemPrompt),
      ...messages.map(msg => 
        msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      )
    ];

    // Gemini Model Invoke 🚀
    const response = await geminiModel.invoke(formattedMessages);
    const content = contentToText(response.content).trim();

    if (!content) throw new Error("AI returned an empty response");
    return content;
  } catch (error) {
    console.error("❌ generateAIResponse ERROR:", error);
    throw error;
  }
};

export { generateChatTitle };