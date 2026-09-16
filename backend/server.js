import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import http from "http"
import connectToDB from "./src/config/database.js";
// import { testAi } from "./src/service/ai.service.js";
import { initSocket } from './src/socket/server.socket.js';
import { emailQueue } from './src/queues/email.queue.js';

// testAi()

const httpServer = http.createServer(app)

initSocket(httpServer)

connectToDB();

httpServer.listen(3000,async () => {
  console.log("Server Started at port 3000");

    await emailQueue.add("test-email", {
    to: "test@example.com",
    subject: "KNOW-AI Test Email",
    message: "This is a test email job.",
  });

  console.log("📨 Test email job added");

});
