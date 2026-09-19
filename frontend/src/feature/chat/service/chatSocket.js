import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

if (!SOCKET_URL) console.error("❌ VITE_BACKEND_URL is missing");

export const chatSocket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
});

chatSocket.on("connect", () => console.log("🟢 Chat socket connected:", chatSocket.id));
chatSocket.on("disconnect", (reason) => console.log("🔴 Chat socket disconnected:", reason));
chatSocket.on("connect_error", (error) => console.error("❌ Chat socket connection error:", error.message));

export const connectChatSocket = () => {
  if (!chatSocket.connected) chatSocket.connect();
};

export const disconnectChatSocket = () => {
  if (chatSocket.connected) chatSocket.disconnect();
};

export const joinChatRoom = (chatId) => {
  if (!chatId) return;
  if (!chatSocket.connected) chatSocket.connect();
  chatSocket.emit("chat:join", chatId);
  console.log("➡️ Joining chat room:", chatId);
};

export const leaveChatRoom = (chatId) => {
  if (!chatId || !chatSocket.connected) return;
  chatSocket.emit("chat:leave", chatId);
  console.log("⬅️ Leaving chat room:", chatId);
};

export default chatSocket;