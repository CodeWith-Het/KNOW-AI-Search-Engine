import dotenv from "dotenv"
dotenv.config()

import http from "http";
import app from "./src/app.js";
import { initSocket } from "./src/socket/server.socket.js";
import connectToDB from "./src/config/database.js";

const server = http.createServer(app);

initSocket(server);
connectToDB();

const port = Number(process.env.PORT) || 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});