import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import ChatModel from "../models/chat.model.js";

let io = null;

/*
 * Get cookie value
 */
const getCookieValue = (cookieHeader, name) => {
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) return null;

  return decodeURIComponent(
    cookie.slice(name.length + 1),
  );
};

/*
 * Initialize Socket.IO
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        process.env.FRONTEND_URL,
      ].filter(Boolean),

      methods: ["GET", "POST"],

      credentials: true,
    },
  });

  /*
   * Socket Authentication
   */
  io.use((socket, next) => {
    const token = getCookieValue(
      socket.handshake.headers.cookie,
      "token",
    );

    if (!token) {
      return next(
        new Error("Authentication required"),
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
      );

      socket.user = decoded;

      next();
    } catch (error) {
      console.error(
        "Socket authentication error:",
        error.message,
      );

      next(new Error("Invalid authentication token"));
    }
  });

  /*
   * Socket Connection
   */
  io.on("connection", (socket) => {
    console.log(
      `🟢 Socket connected: ${socket.id}`,
    );

    console.log(
      `👤 Socket user: ${socket.user?.id}`,
    );

    /*
     * Join chat room
     */
    socket.on("chat:join", async (chatId) => {
      try {
        if (
          typeof chatId !== "string" ||
          !chatId.trim()
        ) {
          return;
        }

        const chat = await ChatModel.exists({
          _id: chatId,
          user: socket.user.id,
        });

        if (!chat) {
          console.log(
            `❌ Unauthorized chat room: ${chatId}`,
          );

          return;
        }

        socket.join(`chat:${chatId}`);

        console.log(
          `➡️ ${socket.id} joined chat:${chatId}`,
        );
      } catch (error) {
        console.error(
          "Socket join error:",
          error.message,
        );
      }
    });

    /*
     * Leave chat room
     */
    socket.on("chat:leave", (chatId) => {
      if (
        typeof chatId !== "string" ||
        !chatId.trim()
      ) {
        return;
      }

      socket.leave(`chat:${chatId}`);

      console.log(
        `⬅️ ${socket.id} left chat:${chatId}`,
      );
    });

    /*
     * Disconnect
     */
    socket.on("disconnect", (reason) => {
      console.log(
        `🔴 Socket disconnected: ${socket.id}`,
        reason,
      );
    });
  });

  return io;
};

/*
 * Emit new chat message
 */
export const emitChatMessage = (
  chatId,
  payload,
) => {
  if (!io) {
    console.warn(
      "Socket.IO is not initialized",
    );

    return;
  }

  io.to(`chat:${chatId}`).emit(
    "chat:message",
    payload,
  );
};

/*
 * Get Socket.IO instance
 */
export const getIo = () => {
  return io;
};