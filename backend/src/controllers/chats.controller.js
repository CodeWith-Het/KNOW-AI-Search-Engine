import ChatModel from "../models/chat.model.js";
import MessageModel from "../models/message.model.js";

import {
  generateAIResponse,
  generateChatTitle,
} from "../service/ai.service.js";

/**
 * Create New Chat
 * POST /api/chats/
 */
export const createChat = async (req, res) => {
  try {
    const userId = req.user.id;

    const chat = await ChatModel.create({
      user: userId,
      title: "New Chat",
    });

    return res.status(201).json({
      success: true,
      message: "Chat created successfully",
      chat,
    });
  } catch (error) {
    console.error("Create Chat Error:", error);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to create chat"
          : error.message,
    });
  }
};

/**
 * Get All Chats Of Logged-in User
 * GET /api/chats/
 */
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await ChatModel.find({
      user: userId,
    })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("Get User Chats Error:", error);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to fetch chats"
          : error.message,
    });
  }
};

/**
 * Search Chats
 * GET /api/chats/search?q=react
 */
export const searchChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const chats = await ChatModel.find({
      user: userId,
      title: {
        $regex: q.trim(),
        $options: "i",
      },
    })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("Search Chats Error:", error);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to search chats"
          : error.message,
    });
  }
};

/**
 * Get Specific Chat With Messages
 * GET /api/chats/:chatId
 */
export const getChatById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const chat = await ChatModel.findOne({
      _id: chatId,
      user: userId,
    }).lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const messages = await MessageModel.find({
      chat: chatId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      chat,
      messages,
    });
  } catch (error) {
    console.error("Get Chat By ID Error:", error);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to fetch chat"
          : error.message,
    });
  }
};

/**
 * Get All Messages Of Specific Chat
 * GET /api/chats/:chatId/message
 */
export const getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    // Verify that chat belongs to logged-in user
    const chat = await ChatModel.findOne({
      _id: chatId,
      user: userId,
    }).lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const messages = await MessageModel.find({
      chat: chatId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get Chat Messages Error:", error);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to fetch messages"
          : error.message,
    });
  }
};

/**
 * Send Message
 * POST /api/chats/message
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId, message } = req.body;

    // Validate request
    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const userMessage = message.trim();

    // Verify chat ownership
    const chat = await ChatModel.findOne({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    /**
     * Check whether this is the first user message.
     * Title will be generated ONLY once.
     */
    const previousUserMessageCount = await MessageModel.countDocuments({
      chat: chatId,
      role: "user",
    });

    const isFirstMessage = previousUserMessageCount === 0;

    /**
     * Save user message
     */
    const savedUserMessage = await MessageModel.create({
      chat: chatId,
      role: "user",
      content: userMessage,
    });

    /**
     * Get complete conversation history
     * for Gemini Agent.
     */
    const conversationMessages = await MessageModel.find({
      chat: chatId,
    })
      .sort({ createdAt: 1 })
      .lean();

    const aiMessages = conversationMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    /**
     * Generate AI response
     */
    const aiResponse = await generateAIResponse(aiMessages);

    /**
     * Save assistant message
     */
    const savedAssistantMessage = await MessageModel.create({
      chat: chatId,
      role: "assistant",
      content: aiResponse,
    });

    /**
     * Generate title ONLY for first user message.
     */
    let updatedChat = chat;

    if (isFirstMessage) {
      try {
        const generatedTitle = await generateChatTitle(userMessage);

        updatedChat = await ChatModel.findOneAndUpdate(
          {
            _id: chatId,
            user: userId,
          },
          {
            title: generatedTitle,
          },
          {
            new: true,
            runValidators: true,
          }
        );
      } catch (titleError) {
        /**
         * Title generation failure should not
         * make the entire chat request fail.
         */
        console.error("Generate Chat Title Error:", titleError);
      }
    } else {
      /**
       * Update chat timestamp for sorting.
       */
      updatedChat = await ChatModel.findOneAndUpdate(
        {
          _id: chatId,
          user: userId,
        },
        {
          $set: {
            updatedAt: new Date(),
          },
        },
        {
          new: true,
        }
      );
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",

      chat: updatedChat,

      userMessage: savedUserMessage,

      assistantMessage: savedAssistantMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to send message"
          : error.message,
    });
  }
};

/**
 * Update Chat Title
 * PATCH /api/chats/:chatId
 */
export const updateChatTitle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Chat title is required",
      });
    }

    const chat = await ChatModel.findOneAndUpdate(
      {
        _id: chatId,
        user: userId,
      },
      {
        title: title.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat title updated successfully",
      chat,
    });
  } catch (error) {
    console.error("Update Chat Title Error:", error);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to update chat title"
          : error.message,
    });
  }
};

/**
 * Delete Chat
 * DELETE /api/chats/:chatId
 */
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const chat = await ChatModel.findOneAndDelete({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Delete all messages belonging to this chat
    await MessageModel.deleteMany({
      chat: chatId,
    });

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete Chat Error:", error);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Failed to delete chat"
          : error.message,
    });
  }
};