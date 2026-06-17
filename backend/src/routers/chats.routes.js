import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.js';
import { getChats, getMessage, sendMessage } from '../controllers/chats.controller.js';

const chatRouter = Router()

chatRouter.post("/message",authUser,sendMessage)
chatRouter.get("/",authUser,getChats)
chatRouter.get("/:chatid/messages",authUser,getMessage)

export default chatRouter