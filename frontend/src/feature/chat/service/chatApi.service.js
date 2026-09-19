import axios from "axios";

const chatApi = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/chats`,
  withCredentials: true,
});

const getError = (error, fallback) => {
  const serverMessage = error?.response?.data?.message;
  return new Error(serverMessage || error?.message || fallback, { cause: error });
};

export const getChats = async () => {
  try {
    const response = await chatApi.get("/");
    return Array.isArray(response.data?.chats) ? response.data.chats : [];
  } catch (error) {
    throw getError(error, "Unable to load chats");
  }
};

export const searchChats = async (query) => {
  try {
    const response = await chatApi.get("/search", { params: { q: query } });
    return Array.isArray(response.data?.chats) ? response.data.chats : [];
  } catch (error) {
    throw getError(error, "Unable to search chats");
  }
};

export const createChat = async () => {
  try {
    const response = await chatApi.post("/");
    const chat = response.data?.chat;
    if (!chat?._id) throw new Error("Server created chat but Chat ID is missing");
    return chat;
  } catch (error) {
    throw getError(error, "Unable to create a chat");
  }
};

export const getChat = async (chatId) => {
  try {
    if (!chatId) throw new Error("Chat ID is required");
    const response = await chatApi.get(`/${chatId}`);
    return response.data;
  } catch (error) {
    throw getError(error, "Unable to load this chat");
  }
};

export const sendMessage = async ({ chatId, message }) => {
  try {
    if (!chatId) throw new Error("Chat ID is required");
    if (!message?.trim()) throw new Error("Message is required");

    const response = await chatApi.post(`/${chatId}/message`, { message: message.trim() });
    return response.data;
  } catch (error) {
    throw getError(error, "Unable to send your message");
  }
};

export const deleteChat = async (chatId) => {
  try {
    if (!chatId) throw new Error("Chat ID is required");
    await chatApi.delete(`/${chatId}`);
    return chatId;
  } catch (error) {
    throw getError(error, "Unable to delete chat");
  }
};