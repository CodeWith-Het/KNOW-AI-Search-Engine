import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import { testAi } from "./src/service/ai.service.js";

testAi()

connectToDB();

const server = app.listen(3000, () => {
  console.log("Server Started at port 3000");
});
