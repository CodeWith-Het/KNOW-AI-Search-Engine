import { generateChatTitle, generateResponse } from "../service/ai.service.js"
import chatModel from './../models/chat.model.js';
import messageModel from './../models/message.model.js';

export const sendMessage = async (req, res) => {
    try {
        const { message,chat:chatId } = req.body

    let title = null, chat=null

    if (!chatId) {
         title = await generateChatTitle(message)

         chat = await chatModel.create({
            user: req.user.id,
            title
        })
    }

    
    const userMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: message,
        role:"user"
    })

    const messages = await messageModel.find({ chat: chatId || chat._id });
        
    const aiResponse = await generateResponse(messages)

    const aiMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: aiResponse,
        role:"ai"
    })


    res.status(201).json({
        message: "chating successfully",
        chat:chatId || chat._id,
        aiMessage
    })
    }
    catch (error) {
        res.status(500).json({
            message:"server crash",
            error: error.message
        })
    }
}

export const getChats = async (req,res)=>{
    try{
        const user = req.user.id

        const chats = await chatModel.find({user:user})

        if(chats.length == 0){
            return res.status(404).json({
                success:false,
                message:"chat not found or are you new user?"
            })
        }

        res.status(200).json({
            message:"chats fetched successfully",
            chats
        })
    }
    catch(error){
        res.status(500).json({
            message:"server crash",
            error:error.message
        })
    }
}

export const getMessages = async (req,res)=>{
    try {
        const { chatid: chatId } = req.params   

        if(!chatId){
            return res.status(404).json({
                success:false,
                message:"Chat Not Found"
            })
        }

        const messages = await messageModel.find({chat:chatId})

        res.status(200).json({
            success:true,
            message:"Chat successfully fetched",
            messages
        })

    } catch (error) {
        res.status(500).json({
            message:"Server crash",
            error:error.message
        })
    }
}

export const deleteChat = async (req,res)=>{
    try{
        const {chatid:chatId} = req.params

    if(!chatId){
        return res.status(404).json({
            success:false,
            message:"chat not found"
        })
    }

    const deletedChat = await chatModel.findByIdAndDelete(chatId)

    if(!deletedChat){
        return res.status(404).json({
            success:false,
            message:"chat not found"
        })
    }

    await messageModel.deleteMany({chat:chatId})

    res.status(200).json({
        success:true,
        message:"chat successfully deleted"
    })
    }
    catch(error){
        res.status(500).json({
            message:"server crash",
            error:error.message
        })
    }
}