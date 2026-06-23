import { generateChatTitle, generateResponse } from "../service/ai.service.js"
import chatModel from './../models/chat.model.js';
import messageModel from './../models/message.model.js';

export const sendMessage = async (req, res) => {
    try {
        const { message, chat: chatId } = req.body

    let createdChatId = chatId

    if (!chatId) {
         const title = await generateChatTitle(message)

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
        res.status(500).json({
            message:"server crash",
            error: error.message
        })
    }
}

export const getChats = async (req,res)=>{
    try{
        const user = req.user.id

        const chats = await chatModel.find({user:user}).sort({createdAt:-1})

        if(chats.length == 0){
            return res.status(200).json({
                success:false,
                message: "chat not found. Welcome New User",
                chats:[]
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