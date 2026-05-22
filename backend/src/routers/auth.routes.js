import { Router } from "express";
import { registerUser, verifyEmailUrl } from "../controllers/auth.controller.js";
import { registerValidation } from '../validation/auth.validation.js';
const authRouter = Router()

authRouter.post("/register", registerValidation, registerUser)
authRouter.get("/verify-email", verifyEmailUrl);

export default authRouter