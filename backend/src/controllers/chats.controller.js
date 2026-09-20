import mongoose from "mongoose";
import { tavily } from "@tavily/core";
import ChatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import {
  generateAIResponse,
  streamAIResponse,
  generateChatTitle,
} from "../service/ai.service.js";
import { performDeepResearch } from "../service/ai.deepresearch.js";

export const createChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const chat = await ChatModel.create({
      user: userId,
      title: "New Chat",
    });

    return res
      .status(201)
      .json({ success: true, message: "Chat created successfully", chat });
  } catch (error) {
    console.error("❌ Create Chat Error:", error);
    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to create chat"
          : error.message,
    });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await ChatModel.find({ user: userId })
      .sort({ pinned: -1, updatedAt: -1 })
      .lean();
    return res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("❌ Get User Chats Error:", error);
    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to fetch chats"
          : error.message,
    });
  }
};

export const searchChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const chats = await ChatModel.find({
      user: userId,
      title: { $regex: q.trim(), $options: "i" },
    })
      .sort({ pinned: -1, updatedAt: -1 })
      .lean();

    return res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("❌ Search Chats Error:", error);
    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to search chats"
          : error.message,
    });
  }
};

export const getChatById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid Chat ID" });

    const chat = await ChatModel.findOne({ _id: chatId, user: userId }).lean();
    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });

    const messages = await MessageModel.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .lean();
    return res.status(200).json({ success: true, chat, messages });
  } catch (error) {
    console.error("❌ Get Chat By ID Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid Chat ID" });

    const chat = await ChatModel.findOne({ _id: chatId, user: userId }).lean();
    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });

    const messages = await MessageModel.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .lean();
    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("❌ Get Chat Messages Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let clientDisconnected = false;
  let agentStream;
  req.on("close", () => {
    clientDisconnected = true;
    Promise.resolve(agentStream?.return?.()).catch(() => {});
  });

  const sendEvent = (payload) => {
    if (!clientDisconnected && !res.writableEnded) {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  };

  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { message, mode } = req.body;

    if (!message || !message.trim()) {
      sendEvent({ type: "error", message: "Message is required" });
      return res.end();
    }

    const userMessage = message.trim();
    let chatIdForRequest;
    let chat;
    let isFirstMessage = false;
    let persistencePromise;
    let titlePromise;

    if (chatId === "new") {
      chatIdForRequest = new mongoose.Types.ObjectId();
      isFirstMessage = true;

      sendEvent({ type: "chat_id", chatId: chatIdForRequest.toString() });

      persistencePromise = Promise.all([
        ChatModel.create({
          _id: chatIdForRequest,
          user: userId,
          title: "New Chat",
        }),
        MessageModel.create({
          chat: chatIdForRequest,
          role: "user",
          content: userMessage,
        }),
      ]);

      titlePromise = generateChatTitle(userMessage)
        .then(async (generatedTitle) => {
          if (!generatedTitle || clientDisconnected) return null;
          await persistencePromise;
          await ChatModel.findOneAndUpdate(
            { _id: chatIdForRequest, user: userId },
            { $set: { title: generatedTitle, updatedAt: new Date() } },
          );
          return generatedTitle;
        })
        .catch(() => null);
    } else {
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        sendEvent({ type: "error", message: "Invalid Chat ID" });
        return res.end();
      }

      chatIdForRequest = new mongoose.Types.ObjectId(chatId);
      chat = await ChatModel.findOne({ _id: chatIdForRequest, user: userId });

      if (!chat) {
        sendEvent({ type: "error", message: "Chat not found" });
        return res.end();
      }

      const previousUserMessageCount = await MessageModel.countDocuments({
        chat: chatIdForRequest,
        role: "user",
      });
      isFirstMessage = previousUserMessageCount === 0;

      await MessageModel.create({
        chat: chatIdForRequest,
        role: "user",
        content: userMessage,
      });

      if (isFirstMessage) {
        titlePromise = generateChatTitle(userMessage)
          .then(async (generatedTitle) => {
            if (!generatedTitle || clientDisconnected) return null;
            await ChatModel.findOneAndUpdate(
              { _id: chatIdForRequest, user: userId },
              { $set: { title: generatedTitle, updatedAt: new Date() } },
            );
            return generatedTitle;
          })
          .catch(() => null);
      }
    }

    const conversationMessages = chat
      ? await MessageModel.find({ chat: chatIdForRequest })
          .sort({ createdAt: 1 })
          .lean()
      : [{ role: "user", content: userMessage }];

    const aiMessages = conversationMessages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    // ==========================================
    // 🔥 WEB SEARCH & DEEP RESEARCH LOGIC 🔥
    // ==========================================
    let finalCitations = [];

    if (mode === "web" || mode === "deep_research") {
      try {
        let contextText = "";

        if (mode === "deep_research") {
          // Yahan hum UI event callback pass kar rahe hain Engine ko
          const researchData = await performDeepResearch(
            userMessage,
            sendEvent,
          );

          if (researchData.citations.length > 0) {
            // STEP 6 PREP: Final Report Generation Status
            sendEvent({
              type: "status",
              content: "✍️ Synthesizing Final Research Report...",
            });
            finalCitations = researchData.citations;
            contextText = researchData.contextText;
          } else {
            sendEvent({
              type: "status",
              content: "Deep search yielded no results. Generating response...",
            });
          }
        } else {
          // Normal Web Search Mode
          sendEvent({ type: "status", content: "Searching the web..." });
          const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
          const searchRes = await tvly.search(userMessage, {
            searchDepth: "advanced",
            maxResults: 5,
          });

          if (searchRes && searchRes.results && searchRes.results.length > 0) {
            sendEvent({ type: "status", content: "Analyzing sources..." });
            finalCitations = searchRes.results.map((r, i) => ({
              id: i + 1,
              url: r.url,
              title: r.title,
            }));
            contextText = searchRes.results
              .map(
                (r, i) =>
                  `[EVIDENCE BLOCK ${i + 1}]\nSource ID: [${i + 1}]\nTitle: ${r.title}\nContent: ${r.content}`,
              )
              .join("\n\n");
          } else {
            sendEvent({
              type: "status",
              content: "No results found. Generating response...",
            });
          }
        }

        // STEP 6: Final Research Report Prompt (Strict AI Analyst)
        if (contextText) {
          let finalPrompt = "";

          if (mode === "deep_research") {
            finalPrompt = `You are a Principal Data Analyst. Your task is to write a final, comprehensive Research Report based strictly on the extracted evidence blocks provided below.

CRITICAL RESEARCH RULES & STRUCTURE:
1. Executive Summary: Start with a brief, high-level summary of the findings.
2. Structured Sections: Group information logically using Markdown Headers (##, ###).
3. Data Presentation: You MUST include at least one Markdown Table to compare metrics, frameworks, companies, or timelines if the data supports it.
4. Data Integrity & Context: NEVER state a statistic or metric generally. You MUST specify the exact context (e.g., year, specific company case study, or survey name) as mentioned in the evidence.
5. Strict Citations: Every single factual claim, number, and quote MUST end with its specific Source ID in brackets, e.g., "In a 2025 survey, adoption was 44% [2]." Do not mix up sources.

--- EXTRACTED EVIDENCE BLOCKS ---
${contextText}

--- ORIGINAL USER QUERY ---
${userMessage}

Synthesize the Final Research Report now.`;
          } else {
            // Normal Web Mode Prompt
            finalPrompt = `You are a helpful research assistant. Answer the user's question accurately using ONLY the provided evidence blocks.
Cite your facts using Source IDs in brackets, e.g., "Fact [1]." 
If the context lacks the answer, state that clearly.

--- EXTRACTED EVIDENCE BLOCKS ---
${contextText}

--- USER QUESTION ---
${userMessage}`;
          }

          // Override the last message with our strict prompt
          aiMessages[aiMessages.length - 1].content = finalPrompt;
          sendEvent({ type: "citations", citations: finalCitations });
        }
      } catch (error) {
        console.error("Web/Deep Research Error:", error.message || error);
        sendEvent({
          type: "status",
          content: "Search unavailable. Generating response...",
        });

        const fallbackPrompt = `The user asked: "${userMessage}". 
IMPORTANT RULE: Your live web search tool just failed. You DO NOT have access to today's latest news. 
You must reply honestly to the user: "I apologize, but my live web search is currently unavailable. Here is the general background information I know..."
DO NOT invent or guess today's news.`;

        aiMessages[aiMessages.length - 1].content = fallbackPrompt;
      }
    }

    // AI Generation
    agentStream = await streamAIResponse(aiMessages);
    let fullAiResponse = "";

    for await (const chunk of agentStream) {
      if (clientDisconnected) break;
      const token =
        typeof chunk.content === "string"
          ? chunk.content
          : Array.isArray(chunk.content)
            ? chunk.content.map((item) => item?.text || "").join("")
            : "";

      if (!token) continue;
      fullAiResponse += token;
      sendEvent({ type: "token", content: token });
    }

    if (clientDisconnected) return;

    if (!fullAiResponse.trim()) {
      try {
        const fallbackResponse = await generateAIResponse(aiMessages);
        if (fallbackResponse?.trim()) {
          fullAiResponse = fallbackResponse;
          sendEvent({ type: "token", content: fallbackResponse });
        }
      } catch (fallbackError) {
        console.error("❌ Fallback AI generation failed:", fallbackError);
      }
    }

    if (!fullAiResponse.trim())
      throw new Error("AI returned an empty response");

    await persistencePromise;

    // Save with citations
    await MessageModel.create({
      chat: chatIdForRequest,
      role: "assistant",
      content: fullAiResponse.trim(),
      citations: finalCitations,
    });

    await ChatModel.findOneAndUpdate(
      { _id: chatIdForRequest, user: userId },
      { $set: { updatedAt: new Date() } },
    );

    if (isFirstMessage && titlePromise) {
      const title = await titlePromise;
      if (title) sendEvent({ type: "title", title });
    }

    sendEvent({ type: "done" });
    return res.end();
  } catch (error) {
    console.error("❌ SEND MESSAGE ERROR:", error);
    sendEvent({
      type: "error",
      message: "An error occurred while generating the response.",
    });
    if (!clientDisconnected) sendEvent({ type: "done" });
    return res.end();
  }
};

export const updateChatTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim())
      return res
        .status(400)
        .json({ success: false, message: "Chat title is required" });
    if (!mongoose.Types.ObjectId.isValid(chatId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid Chat ID" });

    const chat = await ChatModel.findOneAndUpdate(
      { _id: chatId, user: userId },
      { $set: { title: title.trim(), updatedAt: new Date() } },
      { new: true, runValidators: true },
    );

    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    return res
      .status(200)
      .json({
        success: true,
        message: "Chat title updated successfully",
        chat,
      });
  } catch (error) {
    console.error("❌ Update Chat Title Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const togglePinChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { pinned } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chatId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid Chat ID" });
    if (typeof pinned !== "boolean")
      return res
        .status(400)
        .json({ success: false, message: "Pinned state is required" });

    const chat = await ChatModel.findOneAndUpdate(
      { _id: chatId, user: userId },
      { $set: { pinned, updatedAt: new Date() } },
      { new: true, runValidators: true },
    );

    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });

    return res
      .status(200)
      .json({
        success: true,
        message: pinned
          ? "Chat pinned successfully"
          : "Chat unpinned successfully",
        chat,
      });
  } catch (error) {
    console.error("❌ Toggle Pin Chat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid Chat ID" });

    const chat = await ChatModel.findOneAndDelete({
      _id: chatId,
      user: userId,
    });
    if (!chat)
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });

    await MessageModel.deleteMany({ chat: chatId });
    return res
      .status(200)
      .json({ success: true, message: "Chat deleted successfully", chatId });
  } catch (error) {
    console.error("❌ Delete Chat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
