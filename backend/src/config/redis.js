import dotenv from "dotenv";
import Redis from "ioredis";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// src/config/redis.js -> backend/.env
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

console.log(
  "REDIS_URL loaded:",
  process.env.REDIS_URL ? "YES" : "NO"
);

if (!process.env.REDIS_URL) {
  throw new Error("❌ REDIS_URL is missing in .env");
}

const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("✅ Redis connected");
});

redisConnection.on("ready", () => {
  console.log("🚀 Redis ready");
});

redisConnection.on("error", (error) => {
  console.error("❌ Redis Error:", error.message);
});

export default redisConnection;