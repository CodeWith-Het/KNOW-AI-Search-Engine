import mongoose from "mongoose";
import ChatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import { generateAIResponse, streamAIResponse, generateChatTitle } from "../service/ai.service.js";

// =====================================================
// CREATE NEW CHAT
// =====================================================
export const createChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const chat = await ChatModel.create({
      user: userId,
      title: "New Chat",
    });

    return res.status(201).json({ success: true, message: "Chat created successfully", chat });
  } catch (error) {
    console.error("❌ Create Chat Error:", error);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production" ? "Failed to create chat" : error.message,
    });
  }
};

// =====================================================
// GET ALL USER CHATS
// =====================================================
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await ChatModel.find({ user: userId }).sort({ updatedAt: -1 }).lean();
    return res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("❌ Get User Chats Error:", error);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production" ? "Failed to fetch chats" : error.message,
    });
  }
};

// =====================================================
// SEARCH CHATS
// =====================================================
export const searchChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const chats = await ChatModel.find({
      user: userId,
      title: { $regex: q.trim(), $options: "i" },
    }).sort({ updatedAt: -1 }).lean();

    return res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("❌ Search Chats Error:", error);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production" ? "Failed to search chats" : error.message,
    });
  }
};

// =====================================================
// GET SINGLE CHAT
// =====================================================
export const getChatById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid Chat ID" });
    }

    const chat = await ChatModel.findOne({ _id: chatId, user: userId }).lean();
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    const messages = await MessageModel.find({ chat: chatId }).sort({ createdAt: 1 }).lean();
    return res.status(200).json({ success: true, chat, messages });
  } catch (error) {
    console.error("❌ Get Chat By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production" ? "Failed to fetch chat" : error.message,
    });
  }
};

// =====================================================
// GET CHAT MESSAGES
// =====================================================
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid Chat ID" });
    }

    const chat = await ChatModel.findOne({ _id: chatId, user: userId }).lean();
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    const messages = await MessageModel.find({ chat: chatId }).sort({ createdAt: 1 }).lean();
    return res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("❌ Get Chat Messages Error:", error);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production" ? "Failed to fetch messages" : error.message,
    });
  }
};

// =====================================================
// SEND MESSAGE STREAM (POST /api/chats/:chatId/message)
// =====================================================
export const sendMessage = async (req, res) => {
  // 1. Setup Server-Sent Events (SSE) Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { message } = req.body;

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      sendEvent({ type: "error", message: "Invalid Chat ID" });
      return res.end();
    }
    if (!message || !message.trim()) {
      sendEvent({ type: "error", message: "Message is required" });
      return res.end();
    }

    const userMessage = message.trim();
    const chat = await ChatModel.findOne({ _id: chatId, user: userId });
    
    if (!chat) {
      sendEvent({ type: "error", message: "Chat not found" });
      return res.end();
    }

    const previousUserMessageCount = await MessageModel.countDocuments({ chat: chat._id, role: "user" });
    const isFirstMessage = previousUserMessageCount === 0;

    // 2. Save User Message immediately
    await MessageModel.create({
      chat: chat._id,
      role: "user",
      content: userMessage,
    });

    const conversationMessages = await MessageModel.find({ chat: chat._id }).sort({ createdAt: 1 }).lean();
    const aiMessages = conversationMessages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    // 3. Request Stream from AI Service
    const stream = await streamAIResponse(aiMessages);
    let fullAiResponse = "";

    // 4. Iterate over chunks and stream directly to client
    for await (const chunk of stream) {
      const token = typeof chunk.content === "string" ? chunk.content : (chunk.content[0]?.text || "");
      if (token) {
        fullAiResponse += token;
        sendEvent({ type: "token", text: token });
      }
    }

    if (!fullAiResponse.trim()) {
      throw new Error("AI returned an empty response");
    }

    // 5. Save the final aggregated AI response to database
    await MessageModel.create({
      chat: chat._id,
      role: "assistant",
      content: fullAiResponse.trim(),
    });

    // 6. Handle background tasks (Title generation & UpdatedAt)
    if (isFirstMessage) {
      generateChatTitle(userMessage).then(async (generatedTitle) => {
        if (generatedTitle) {
          await ChatModel.findOneAndUpdate(
            { _id: chat._id, user: userId },
            { $set: { title: generatedTitle, updatedAt: new Date() } }
          );
        }
      }).catch(err => console.error("⚠️ Title Gen Error:", err.message));
    } else {
      await ChatModel.findOneAndUpdate(
        { _id: chat._id, user: userId },
        { $set: { updatedAt: new Date() } }
      );
    }

    // 7. Close Stream safely
    sendEvent({ type: "done" });
    res.end();

  } catch (error) {
    console.error("❌ SEND MESSAGE STREAM ERROR:", error);
    
    // Catch rate limit errors gracefully for the UI
    const isRateLimit = error?.status === 429 || error?.message?.includes("429");
    const fallbackMsg = isRateLimit 
        ? "Sorry, the AI service is currently busy due to rate limits. Please try again in a minute."
        : "An error occurred while generating the response.";

    sendEvent({ type: "error", message: fallbackMsg });
    sendEvent({ type: "done" });
    res.end();
  }
};

// =====================================================
// UPDATE CHAT TITLE
// =====================================================
export const updateChatTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ success: false, message: "Chat title is required" });
    if (!mongoose.Types.ObjectId.isValid(chatId)) return res.status(400).json({ success: false, message: "Invalid Chat ID" });

    const chat = await ChatModel.findOneAndUpdate(
      { _id: chatId, user: userId },
      { $set: { title: title.trim(), updatedAt: new Date() } },
      { new: true, runValidators: true }
    );

    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });
    return res.status(200).json({ success: true, message: "Chat title updated successfully", chat });
  } catch (error) {
    console.error("❌ Update Chat Title Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =====================================================
// DELETE CHAT
// =====================================================
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) return res.status(400).json({ success: false, message: "Invalid Chat ID" });

    const chat = await ChatModel.findOneAndDelete({ _id: chatId, user: userId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    await MessageModel.deleteMany({ chat: chatId });
    return res.status(200).json({ success: true, message: "Chat deleted successfully", chatId });
  } catch (error) {
    console.error("❌ Delete Chat Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};