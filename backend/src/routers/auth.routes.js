import express from "express";

import {
  registerUser,
  verifyOtp,
  loginUser,
  getUser,
  logoutUser,
  googleAuth,
  googleAuthCallback,
} from "../controllers/auth.controller.js";

import {
  registerValidation,
  otpValidation,
  loginValidation,
} from "../validation/auth.validation.js";

import { authUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerValidation, registerUser);

router.post("/verify-otp", otpValidation, verifyOtp);

router.post("/login", loginValidation, loginUser);

router.get("/me", authUser, getUser);

router.post("/logout", authUser, logoutUser);

router.get("/google", googleAuth);

router.get("/google/callback", googleAuthCallback);

export default router;
