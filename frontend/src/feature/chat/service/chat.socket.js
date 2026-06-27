import { io } from "socket.io-client"

export const initialzeSocketConnection = () => {
    const socket = io(`${import.meta.env.VITE_API_URL}`, {
        withCredentials: true,
        transports:["websocket","polling"]
    })

    socket.on("connect", () => {
        console.log("Connectd to Socket io Server")
    })

    socket.on("connect_error", (err) => {
        console.log("Socket Connection Error:", err.message);
    });
}