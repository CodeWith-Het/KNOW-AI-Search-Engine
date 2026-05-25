import { Router } from "express";
import { getUser, loginUser, registerUser, verifyEmailUrl } from "../controllers/auth.controller.js";
import { registerValidation } from '../validation/auth.validation.js';
import { authUser } from "../middleware/auth.middleware.js";
const authRouter = Router()

authRouter.post("/register", registerValidation, registerUser)
authRouter.get("/verify-email", verifyEmailUrl)
authRouter.post("/login",loginUser)
authRouter.get("/getuser",authUser,getUser)

export default authRouter