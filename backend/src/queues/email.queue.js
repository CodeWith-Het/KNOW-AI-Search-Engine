import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

export const emailQueue = new Queue("emailQueue", {
  connection: redisConnection,

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: {
      count: 100,
    },

    removeOnFail: {
      count: 500,
    },
  },
});

console.log("✅ Email Queue initialized");