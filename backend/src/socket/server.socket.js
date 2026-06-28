import { Server } from 'socket.io';

let io

export const initSocket = (httpServer)=>{
    io = new Server(httpServer, {
        cors: {
            origin: [
                "http://localhost:5173",
                process.env.FRONTEND_URL
            ],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    console.log("Socket io server is RUNNING")

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id)

        socket.on("disconnect", () => {
            console.log("User disconnected: "+socket.id)
        })
    })
}

export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}
