import mongoose from "mongoose";
import ChatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import { generateAIResponse, generateChatTitle } from "../service/ai.service.js";
import { emitChatMessage } from "../socket/server.socket.js";

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
// SEND MESSAGE (POST /api/chats/:chatId/message)
// =====================================================
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { message } = req.body;

    if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid Chat ID" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const userMessage = message.trim();
    const chat = await ChatModel.findOne({ _id: chatId, user: userId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    const previousUserMessageCount = await MessageModel.countDocuments({ chat: chat._id, role: "user" });
    const isFirstMessage = previousUserMessageCount === 0;

    const savedUserMessage = await MessageModel.create({
      chat: chat._id,
      role: "user",
      content: userMessage,
    });

    const conversationMessages = await MessageModel.find({ chat: chat._id }).sort({ createdAt: 1 }).lean();
    const aiMessages = conversationMessages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    let aiResponse;
    try {
      aiResponse = await generateAIResponse(aiMessages);
    } catch (aiError) {
      console.error("❌ AI RESPONSE ERROR:", aiError);
      await MessageModel.findByIdAndDelete(savedUserMessage._id);
      return res.status(502).json({
        success: false,
        message: process.env.NODE_ENV === "production" ? "AI service failed" : aiError.message,
      });
    }

    if (!aiResponse || !aiResponse.trim()) {
      await MessageModel.findByIdAndDelete(savedUserMessage._id);
      return res.status(502).json({ success: false, message: "AI returned an empty response" });
    }

    const savedAssistantMessage = await MessageModel.create({
      chat: chat._id,
      role: "assistant",
      content: aiResponse.trim(),
    });

    let updatedChat = chat;
    if (isFirstMessage) {
      try {
        const generatedTitle = await generateChatTitle(userMessage);
        if (generatedTitle) {
          updatedChat = await ChatModel.findOneAndUpdate(
            { _id: chat._id, user: userId },
            { $set: { title: generatedTitle, updatedAt: new Date() } },
            { new: true, runValidators: true }
          );
        }
      } catch (titleError) {
        console.error("⚠️ Generate Chat Title Error:", titleError.message);
      }
    }

    if (!isFirstMessage) {
      updatedChat = await ChatModel.findOneAndUpdate(
        { _id: chat._id, user: userId },
        { $set: { updatedAt: new Date() } },
        { new: true }
      );
    }

    if (!updatedChat) updatedChat = chat;

    emitChatMessage(chat._id.toString(), {
      chat: updatedChat,
      userMessage: savedUserMessage,
      assistantMessage: savedAssistantMessage,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      chat: updatedChat,
      userMessage: savedUserMessage,
      assistantMessage: savedAssistantMessage,
    });
  } catch (error) {
    console.error("❌ SEND MESSAGE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "production" ? "Failed to send message" : error.message,
    });
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