import { generateChatTitle, generateResponse } from "../service/ai.service.js"

export const sendMessage = async (req, res, next) => {
    const { message } = req.body

    const title = await generateChatTitle(message)
    console.log(title)

    const result = await generateResponse(message)

    res.json({
        message: result
    })
}