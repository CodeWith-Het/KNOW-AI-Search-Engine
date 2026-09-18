import mongoose from "mongoose";

const chatSchemaModel = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ChatModel = mongoose.model("Chat", chatSchemaModel);

export default ChatModel