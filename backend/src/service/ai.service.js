import agent from "../ai/ai.agent.js";
import { generateChatTitle } from "../ai/ai.title.js";

export const generateAIResponse = async (messages) => {
  const response = await agent.invoke({
    messages,
  });

  const lastMessage = response.messages.at(-1);

  return lastMessage.content.toString();
};

export { generateChatTitle };