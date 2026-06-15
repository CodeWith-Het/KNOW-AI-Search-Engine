import dotenv from "dotenv";
dotenv.config();

import * as z from "zod";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"; 
import readline from "readline/promises";
import { HumanMessage } from "@langchain/core/messages";
import { sendmail } from "./mail.service.js";

import { createAgent } from "langchain"; 
import { TavilySearch } from "@langchain/tavily";

const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const emailTool = tool(
  async ({ to, subject, html }) => {
    await sendmail({ to, subject, html });
    return `Email successfully sent to ${to}!`;
  },
  {
    name: "emailTool",
    description: "Use this to send an email. Requires recipient email (to), subject, and html content.",
    schema: z.object({
      to: z.string().describe("Recipient email address"),
      subject: z.string().describe("Email subject line"),
      html: z.string().describe("Email body content in HTML or plain text"),
    }),
  }
);

// 🎯 Search Tool
const searchTool = new TavilySearch({
  maxResults: 2,
});

// 🎯 model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", 
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

// 🎯 LangChain Agent
const agent = createAgent({
  model: model,
  tools: [emailTool, searchTool],
  systemPrompt: "You are a smart AI agent. You have two main powers: 1. You can search the internet using the search tool to do research on any latest topic. 2. You can send emails using the email tool. Use them wisely based on user requests.",
});

// testAi function 
export const testAi = async () => {
  let chatMessage = []; 

  console.log("🤖 Gemini Research & Email Agent Started! (Type 'exit' to quit)\n");

  while (true) {
    const userInput = await r1.question("\x1b[32mYou:\x1b[0m ");

    if (userInput.toLowerCase() === "exit") {
      console.log("Bye!");
      r1.close();
      break;
    }

    console.log("\x1b[33mThinking...\x1b[0m\n");

    chatMessage.push(new HumanMessage(userInput));

    try {
      const response = await agent.invoke({
        messages: chatMessage,
      });

      chatMessage = response.messages;
      console.log(`\x1b[34m[AI]\x1b[0m ${chatMessage[chatMessage.length - 1].content}\n`);
      
    } catch (error) {
      console.log(`\x1b[31m[API Error]\x1b[0m AI ya API me dikkat aayi: ${error.message}\n`);
    }
  }
};
