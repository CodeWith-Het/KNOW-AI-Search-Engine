import { geminiModel, nvidiaModel, systemPrompt } from "../ai/ai.agent.js";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { generateChatTitle } from "../ai/ai.title.js";

const contentToText = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((item) => (typeof item === "string" ? item : item?.text || "")).join("");
  }
  return String(content ?? "");
};

// 🔥 MODEL ROUTER LOGIC
const getModelForMode = (mode) => {
  // Agar mode web ya deep_research hai, toh Nvidia use karo (High Quality). Warna Gemini.
  return (mode === "web" || mode === "deep_research") ? nvidiaModel : geminiModel;
};

// Standard full response
export const generateAIResponse = async (messages, mode = "normal") => {
  try {
    const formattedMessages = [
      new SystemMessage(systemPrompt()), 
      ...messages.map(msg => 
        msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      )
    ];

    const activeModel = getModelForMode(mode);
    const response = await activeModel.invoke(formattedMessages);
    const content = contentToText(response.content).trim();

    if (!content) throw new Error("AI returned an empty response");
    return content;
  } catch (error) {
    console.error("❌ generateAIResponse ERROR:", error);
    throw error;
  }
};

// ⚡ New Streaming Function with Mode Switching
export const streamAIResponse = async (messages, mode = "normal") => {
  try {
    const formattedMessages = [
      new SystemMessage(systemPrompt()), 
      ...messages.map(msg => 
        msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
      )
    ];

    const activeModel = getModelForMode(mode);
    console.log(`🧠 Router Selected Model: ${mode === "normal" ? "Gemini 2.5 Flash" : "Nvidia Nemotron Ultra"} (Mode: ${mode})`);

    const stream = await activeModel.stream(formattedMessages);
    return stream;
  } catch (error) {
    console.error("❌ streamAIResponse ERROR:", error);
    throw error;
  }
};

export { generateChatTitle };