import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai"; 
import { ChatMistralAI } from "@langchain/mistralai"
import readline from "readline/promises";
import { HumanMessage, SystemMessage, AIMessage} from "@langchain/core/messages";
import * as z from "zod";
import { tool } from "@langchain/core/tools";
import { createAgent } from "langchain";
// import { sendmail } from "./mail.service.js";
import { searchInternet } from './internet.service.js';

const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// const emailTool = tool(
//   async ({ to, subject, html }) => {
//     await sendmail({ to, subject, html });
//     return `Email successfully sent to ${to}!`;
//   },
//   {
//     name: "emailTool",
//     description: "Use this to send an email. Requires recipient email (to), subject, and html content.",
//     schema: z.object({
//       to: z.string().describe("Recipient email address"),
//       subject: z.string().describe("Email subject line"),
//       html: z.string().describe("Email body content in HTML or plain text"),
//     }),
//   }
// );

// 🎯 Search Tool
const searchInternetTool = tool(
  async ({ query }) => {
    return await searchInternet(query); 
  },
  {
    name: "searchInternetTool",
    description: "Use this tool to get the latest internet from the internet",
    schema: z.object({
      query: z.string().describe("The search query string"),
    }),
  }
);

// 🎯 model
const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", 
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

const mistraAiModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey:process.env.MISTRAL_API_KEY
})

// 🎯 Agent
const agent = createAgent({
  model: mistraAiModel,
  tools: [searchInternetTool],
  systemPrompt: "You are a smart AI agent. You have one main power: You can search the internet using the search tool to do research on any latest topic. Use it wisely based on user requests.",
})

// testAi function
// export const testAi = async () => {
//   let chatMessage = [];

//   console.log("🤖 Gemini Research & Email Agent Started! (Type 'exit' to quit)\n");

//   while (true) {
//     const userInput = await r1.question("\x1b[32mYou:\x1b[0m ");

//     if (userInput.toLowerCase() === "exit") {
//       console.log("Bye!");
//       r1.close();
//       break;
//     }

//     console.log("\x1b[33mThinking...\x1b[0m\n");

//     chatMessage.push(new HumanMessage(userInput));

//     try {
//       const response = await agent.invoke({
//         messages: chatMessage,
//       });

//       chatMessage = response.messages;
//       console.log(`\x1b[34m[AI]\x1b[0m ${chatMessage[chatMessage.length - 1].content}\n`);
      
//     } catch (error) {
//       console.log(`\x1b[31m[API Error]\x1b[0m AI ya API me dikkat aayi: ${error.message}\n`);
//     }
//   }
// }

export const generateResponse = async (messages) => {
  try {
    const response = await agent.invoke({
      systemPrompt: "You are a smart AI agent. You have one main power: You can search the internet using the search tool to do research on any latest topic. Use it wisely based on user requests.",
      messages: messages
        .map((msg) => {
          if (msg.role === "user") return new HumanMessage(msg.content);
          if (msg.role === "ai") return new AIMessage(msg.content);
          return null;
        })
        .filter(Boolean),
    });

    return response.messages[response.messages.length - 1].content;
  } catch (error) {
    console.error("gemini Ai Error:", error.message);
    throw error;
  }
}

export const generateChatTitle = async (message) => {
  try {
    const response = await mistraAiModel.invoke([
    new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for chat conversations
      
      User will provide you with the first message of a chat conversation, and you will generate a title that captures 
      the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving
      users a quick understanding of the chat's topic.
      `),
    
     new HumanMessage(`Generate a title for a chat conversation based on the following first message:${message}`)
    ])
    let cleanTitle = response.content.replace(/["']/g, "").trim();
    
    return cleanTitle
  }
  catch (error) {
    console.error("Mistral Ai Error:", error.message);
    throw error;
  }
}