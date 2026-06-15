import express from "express";
import cookieParser from "cookie-parser"
import authRouter from "./routers/auth.routes.js";
import chatRouter from "./routers/chats.routes.js";
import morgan from "morgan"
import cors from "cors"

// last here
import notFound from "./middleware/notfound.middleware.js";
import errorhandle from './middleware/errors.middleware.js';

const app = express();

// middleware
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods:["PUT","GET","POST","DELETE"]
}))

// routers
app.use("/api/auth", authRouter)
app.use("/api/chats",chatRouter)

// last here
app.use(notFound)
app.use(errorhandle)
export default app;
