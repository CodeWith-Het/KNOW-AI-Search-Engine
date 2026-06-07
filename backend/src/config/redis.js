import dotenv from "dotenv"
dotenv.config()

import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL)

redis.on("connect", () => {
    console.log("connect to Redis 🟢")
})

redis.on("error", (error) => {
    console.error("This is error from redis:- ",error)
})

export default redis