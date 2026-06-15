import mongoose from "mongoose";

const chatModelSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required:true
    },
    title: {
        type: string,
        default: 'New Chat',
        required:true
    }
}, {
    timestamps: true
})

const chatModel = mongoose.model("chat", chatModelSchema)
export default chatModel