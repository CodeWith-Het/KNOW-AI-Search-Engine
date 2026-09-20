import mongoose from "mongoose";
import ChatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";
import { generateAIResponse, streamAIResponse, generateChatTitle } from "../service/ai.service.js";

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


// SEARCH CHATS

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
    const { message } = req.body;

    if (!message || !message.trim()) {
      sendEvent({
        type: "error",
        message: "Message is required",
      });

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

      sendEvent({
        type: "chat_id",
        chatId: chatIdForRequest.toString(),
      });

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
        .catch((error) => {
          console.error("⚠️ Title generation error:", error.message);
          return null;
        });

      console.log("🆕 New chat reserved:", chatIdForRequest.toString());
    } else {
      if (!mongoose.Types.ObjectId.isValid(chatId)) {
        sendEvent({
          type: "error",
          message: "Invalid Chat ID",
        });

        return res.end();
      }

      chatIdForRequest = new mongoose.Types.ObjectId(chatId);
      chat = await ChatModel.findOne({
        _id: chatIdForRequest,
        user: userId,
      });

      if (!chat) {
        sendEvent({
          type: "error",
          message: "Chat not found",
        });

        return res.end();
      }

      const previousUserMessageCount =
        await MessageModel.countDocuments({
          chat: chatIdForRequest,
          role: "user",
        });

      isFirstMessage =
        previousUserMessageCount === 0;

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
          .catch((error) => {
            console.error("⚠️ Title generation error:", error.message);
            return null;
          });
      }
    }

    const conversationMessages = chat
      ? await MessageModel.find({ chat: chatIdForRequest })
          .sort({ createdAt: 1 })
          .lean()
      : [{ role: "user", content: userMessage }];

    const aiMessages =
      conversationMessages.map((msg) => ({
        role:
          msg.role === "assistant"
            ? "assistant"
            : "user",

        content: msg.content,
      }));

    agentStream = await streamAIResponse(aiMessages);

    let fullAiResponse = "";

    for await (const chunk of agentStream) {
      if (clientDisconnected) break;

      const token =
        typeof chunk.content === "string"
          ? chunk.content
          : Array.isArray(chunk.content)
            ? chunk.content
                .map((item) => item?.text || "")
                .join("")
            : "";

      if (!token) continue;

      fullAiResponse += token;

      sendEvent({
        type: "token",
        content: token,
      });
    }

    if (clientDisconnected) return;

    if (!fullAiResponse.trim()) {
      throw new Error(
        "AI returned an empty response",
      );
    }

    await persistencePromise;

    await MessageModel.create({
      chat: chatIdForRequest,
      role: "assistant",
      content: fullAiResponse.trim(),
    });

    await ChatModel.findOneAndUpdate(
      {
        _id: chatIdForRequest,
        user: userId,
      },
      {
        $set: {
          updatedAt: new Date(),
        },
      },
    );

    if (isFirstMessage && titlePromise) {
      const title = await titlePromise;
      if (title) sendEvent({ type: "title", title });
    }

    sendEvent({ type: "done" });

    return res.end();

  } catch (error) {
    console.error(
      "❌ SEND MESSAGE STREAM ERROR:",
      error,
    );

    const isRateLimit =
      error?.status === 429 ||
      error?.message?.includes("429");

    const fallbackMsg = isRateLimit
      ? "Sorry, the AI service is currently busy due to rate limits. Please try again in a minute."
      : error?.message ||
        "An error occurred while generating the response.";

    sendEvent({
      type: "error",
      message: fallbackMsg,
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