import mongoose from "mongoose";

const messageSchemaModel = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat",
        required: true,
        index:true
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required:true
    },
    role: {
        type: String,
        enum: ["user", "ai"],
        required:true
    }
},
    {
    timestamps:true
    })

const messageModel = mongoose.model("message",messageSchemaModel)
export default messageModel