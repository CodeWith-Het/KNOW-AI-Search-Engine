import { Server, Socket } from 'socket.io';

let io

export const initSocket = (httpServer)=>{
    io = new Server(httpServer, {
        cors: {
            origin: [
                "http://localhost:5173",
                "https://perplexity-ai-umber.vercel.app"
            ],
            credentials: true
        }
    });

    console.log("Socket io server is RUNNING")

    io.on("connection", (Socket) => {
        console.log("A user connected: " + Socket.id)
    })
}

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}
