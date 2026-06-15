import { Router } from 'express';
import { authUser } from '../middleware/auth.middleware.js';
import { sendMessage } from '../controllers/chats.controller.js';

const chatRouter = Router()

chatRouter.post("/message",authUser,sendMessage)

export default chatRouter