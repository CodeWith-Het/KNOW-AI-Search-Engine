import { geminiModel, systemPrompt } from "../ai/ai.agent.js";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { generateChatTitle } from "../ai/ai.title.js";

const contentToText = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((item) => (typeof item === "string" ? item : item?.text || "")).join("");
  }
  return String(content ?? "");
};

// Standard full response
export const generateAIResponse = async (messages) => {
  try {
    const formattedMessages = [
      new SystemMessage(systemPrompt),
      ...messages.map(msg => 
        msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      )
    ];

    const response = await geminiModel.invoke(formattedMessages);
    const content = contentToText(response.content).trim();

    if (!content) throw new Error("AI returned an empty response");
    return content;
  } catch (error) {
    console.error("❌ generateAIResponse ERROR:", error);
    throw error;
  }
};

// ⚡ New Streaming Function
export const streamAIResponse = async (messages) => {
  try {
    const formattedMessages = [
      new SystemMessage(systemPrompt),
      ...messages.map(msg => 
        msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      )
    ];

    // Returns an async iterable stream instead of waiting for the full block
    const stream = await geminiModel.stream(formattedMessages);
    return stream;
  } catch (error) {
    console.error("❌ streamAIResponse ERROR:", error);
    throw error;
  }
};

export { generateChatTitle };