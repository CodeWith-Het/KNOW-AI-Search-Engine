import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import http from "http"
import connectToDB from "./src/config/database.js";
// import { testAi } from "./src/service/ai.service.js";
import { initSocket } from './src/socket/server.socket.js';

// testAi()

const httpServer = http.createServer(app)

initSocket(httpServer)

connectToDB();

httpServer.listen(3000, () => {
  console.log("Server Started at port 3000");
});
