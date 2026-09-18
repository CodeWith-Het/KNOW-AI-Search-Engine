import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import http from "http"
import connectToDB from "./src/config/database.js";
// import { initSocket } from './src/socket/server.socket.js';

// const httpServer = http.createServer(app)

// initSocket(httpServer)

connectToDB();

// httpServer.listen(3000, () => {
//   console.log("Server Started at port 3000")
// });


app.listen(3000, () => {
  console.log("server started at port 3000")
})