import { io } from "socket.io-client"

export const initialzeSocketConnection = () => {
    const socket = io(`${import.meta.env.VITE_API_URL}`, {
        withCredentials:true
    })

    socket.on("connect", () => {
        console.log("Connectd to Socket io Server")
    })
}