import { Worker } from "bullmq";
import redisConnection from "../config/redis.js";

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    console.log("📩 Email Job Received");
    console.log("Job ID:", job.id);
    console.log("Job Name:", job.name);
    console.log("Job Data:", job.data);
  },
  {
    connection: redisConnection,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`❌ Job ${job?.id} failed:`, error.message);
});

console.log("👷 Email Worker Started");