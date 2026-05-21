import express from "express";
import cookieParser from "cookie-parser"
import authRouter from "./routers/auth.routes.js";

// last here
import errorhandle from './middleware/errors.middleware.js';

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser())

// routers
app.use("/api/auth",authRouter)

// last here
app.use(errorhandle)
export default app;
