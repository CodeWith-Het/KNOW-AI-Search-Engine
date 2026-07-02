import { generateChatTitle, generateResponse } from "../service/ai.service.js"
import chatModel from './../models/chat.model.js';
import messageModel from './../models/message.model.js';
import AppError from './../utils/AppError.js';

export const sendMessage = async (req, res, next) => {
    try {
        const { message, chat: chatId } = req.body

    let createdChatId = chatId

    if (!chatId) {
        const title = await generateChatTitle(message)

        if (!message) {
            return next(new AppError("Message is requied for create chatId",400,"MESSAGE_IS_REQUIRED"))
        }

         const newChatData = await chatModel.create({
            user: req.user.id,
            title:title
         })
         createdChatId = newChatData._id
    }
        
    const userMessage = await messageModel.create({
        chat: createdChatId,
        content: message,
        role:"user"
    })

    const messages = await messageModel.find({ chat: createdChatId });
        
    const aiResponse = await generateResponse(messages)

    const aiMessage = await messageModel.create({
        chat: createdChatId,
        content: aiResponse,
        role:"ai"
    })


    res.status(200).json({
        message: "chating successfully",
        chatId: createdChatId,
        aiMessage
    })
    }
    catch (error) {
       next(error)
    }
}

export const getChats = async (req, res, next)=>{
    try{
        const user = req.user.id

        const chats = await chatModel.find({user:user}).sort({createdAt:-1})

        if(chats.length == 0){
            return res.status(200).json({
                success:true,
                message: "chat not found. Welcome New User",
                chats:[]
            })
        }

        res.status(200).json({
            success:true,
            message:"chats fetched successfully",
            chats
        })
    }
    catch(error){
       next(error)
    }
}

export const getSearchChats = async (req, res, next) => {
    try {
            const userId = req.user.id

    const { keyword } = req.params
    
    if (!keyword) {
        return res.status(200).json({
            success: true,
            message: "No search keyword provided",
            chats:[]
        })
    }

    const matchChats = await chatModel.find({
        user: userId,
        title: { $regex: keyword, $options: "i" }
    }).sort({ createdAt: -1 })
    
    res.status(200).json({
        success: true,
        message: "Chat successfully Search",
        chats:matchChats
    })
    }
    catch (error) {
        next(error)
    }
}

export const getMessages = async (req,res, next)=>{
    try {
        const { chatid: chatId } = req.params   

        if(!chatId){
            return next(new AppError("Chat Not Found",404,"CHAT_NOT_FOUND"))
        }

        const messages = await messageModel.find({chat:chatId})

        res.status(200).json({
            success:true,
            message:"Chat successfully fetched",
            messages
        })

    } catch (error) {
       next(error)
    }
}

export const deleteChat = async (req, res, next) => {
    try {
        const { chatid: chatId } = req.params

        if (!chatId) {
           return next(new AppError("Chat Not Found",404,"CHAT_NOT_FOUND"))
        }

        const deletedChat = await chatModel.findByIdAndDelete(chatId)

        if (!deletedChat) {
            return next(new AppError("Chat Not Found",404,"CHAT_NOT_FOUND"))
        }

        await messageModel.deleteMany({ chat: chatId })

        res.status(200).json({
            success: true,
            message: "chat successfully deleted"
        })
    }
    catch (error) {
        next(error)
    }
}