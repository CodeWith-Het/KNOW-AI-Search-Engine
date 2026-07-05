import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.js';
import { deleteChat, getChats, getMessages, getSearchChats, sendMessage, sendMessageStream } from '../controllers/chats.controller.js';

const chatRouter = Router()

chatRouter.post("/message/stream",authUser,sendMessageStream)
chatRouter.post("/message",authUser,sendMessage)
chatRouter.get("/",authUser,getChats)
chatRouter.get("/search/:keyword",authUser,getSearchChats)
chatRouter.get("/:chatid/messages", authUser, getMessages)
chatRouter.delete("/delete/:chatid",authUser,deleteChat)

export default chatRouter