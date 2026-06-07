import dotenv from "dotenv"
dotenv.config()

import jwt from "jsonwebtoken";
import redis from "../config/redis.js";

export const authUser = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(400).json({
      message: "token not provide , get Loign",
      success: false,
      error: "token not provide",
    });
  }

  // blacklist
  const isBlacklisted = await redis.get(`bl_${token}`);
  if (isBlacklisted) {
    return res.status(401).json({
      success: false,
      message: "Token has been invalidated. Please login again.",
    });
  }

  let decoded = null;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // this is errro show
    console.log("🚨 JWT VERIFY ASLI ERROR:", error.message);
    return res.status(401).json({
      message: "invalid token , please login again",
      success: false,
      error: "Invalid token",
    });
  }
};
