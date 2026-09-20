import express from "express";

import {
  createChat,
  deleteChat,
  getChatById,
  getUserChats,
  searchChats,
  togglePinChat,
  updateChatTitle,
  sendMessage,
  getChatMessages,
} from "../controllers/chats.controller.js";

import { authUser } from "../middleware/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.use(authUser);

chatRouter.post("/", createChat);

chatRouter.get("/", getUserChats);

chatRouter.get("/search", searchChats);

chatRouter.get("/:chatId/message", getChatMessages);

chatRouter.post("/:chatId/message/stream", sendMessage);

chatRouter.post("/:chatId/message", sendMessage);

chatRouter.patch("/:chatId/pin", togglePinChat);

chatRouter.get("/:chatId", getChatById);

chatRouter.patch("/:chatId", updateChatTitle);

chatRouter.delete("/:chatId", deleteChat);

export default chatRouter;