import express from "express";

import {
  createChat,
  deleteChat,
  getChatById,
  getUserChats,
  searchChats,
  updateChatTitle,
  sendMessage,
  getChatMessages,
} from "../controllers/chats.controller.js";

import { authUser } from './../middleware/auth.middleware.js';


const chatRouter = express.Router();

// All chat routes require authentication
chatRouter.use(authUser);

// Create new chat
chatRouter.post("/", createChat);

// Send message in chat
chatRouter.post("/  ", sendMessage);

// Get all messages of a specific chat
chatRouter.get("/:chatId/message", getChatMessages);

// Get all chats of logged-in user
chatRouter.get("/", getUserChats);

// Search chats
chatRouter.get("/search", searchChats);

// Get specific chat
chatRouter.get("/:chatId", getChatById);

// Update chat title
chatRouter.patch("/:chatId", updateChatTitle);

// Delete chat and its messages
chatRouter.delete("/:chatId", deleteChat);

export default chatRouter;