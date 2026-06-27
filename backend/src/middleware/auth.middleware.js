import dotenv from "dotenv"
dotenv.config()

import jwt from "jsonwebtoken";
import redis from "../config/redis.js";

export const authUser = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please login first",
    });
  }

  const isBlacklisted = await redis.get(`blacklist:${token}`);

  if (isBlacklisted) {
    return res.status(401).json({
      success: false,
      message: "Token has been invalidated. Please login again.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("JWT ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};