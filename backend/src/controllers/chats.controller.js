import { generateChatTitle, generateResponse, streamAgentResponse } from "../service/ai.service.js"
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
        
    const { answer, citations } = await generateResponse(messages)

    // Khaali answer kabhi save nahi hona chahiye (agle turn ki history todta hai)
    const safeAnswer = answer?.trim()
        ? answer
        : "I couldn't generate a response for that. Please try rephrasing your question."

    const aiMessage = await messageModel.create({
        chat: createdChatId,
        content: safeAnswer,
        citations,
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

export const sendMessageStream = async (req, res, next) => {

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Chhota helper — har event ko SSE ke sahi format mein bhejta hai
    const sendEvent = (payload) => {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    let createdChatId;

    try {
        const { message, chat: chatId } = req.body;

        if (!message) {
            sendEvent({ type: "error", message: "Message is required" });
            return res.end();
        }

        createdChatId = chatId;

        if (!chatId) {
            const title = await generateChatTitle(message);
            const newChatData = await chatModel.create({
                user: req.user.id,
                title,
            });
            createdChatId = newChatData._id;

            sendEvent({ type: "meta", chatId: createdChatId });
        }

        await messageModel.create({
            chat: createdChatId,
            content: message,
            role: "user",
        });

        const messages = await messageModel.find({ chat: createdChatId });

        const { fullAnswer, citations } = await streamAgentResponse(
            messages,
            (token) => sendEvent({ type: "token", text: token }),
            (status) => sendEvent({ type: "status", text: status }),
        );

        // Khaali answer kabhi DB mein save nahi hona chahiye — warna agle
        // turn pe LLM API isse reject kar degi (empty assistant message)
        const safeAnswer = fullAnswer?.trim()
            ? fullAnswer
            : "I couldn't generate a response for that. Please try rephrasing your question.";

        await messageModel.create({
            chat: createdChatId,
            content: safeAnswer,
            citations,
            role: "ai",
        });

        sendEvent({ type: "citations", citations });
        sendEvent({ type: "done" });
        res.end();
    } catch (error) {
        console.error("Stream error:", error.message);

        // messageModel mein fallback save karne ki koshish karo taaki user ko pata chale ki kuch hua hai
        try {
            if (createdChatId) {
                await messageModel.create({
                    chat: createdChatId,
                    content:
                        "Sorry, I ran into an error while processing that. Please try asking again.",
                    citations: [],
                    role: "ai",
                });
            }
        } catch (saveError) {
            console.error("Fallback save error:", saveError.message);
        }

        sendEvent({ type: "error", message: error.message });
        res.end();
    }
};

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