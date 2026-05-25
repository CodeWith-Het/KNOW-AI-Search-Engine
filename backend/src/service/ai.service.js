import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY
});

export const testAi = async(req,res) => {
    model.invoke("what is express js explain me in 2 lines?").then((response) => {
        console.log(response.text)
    })
}
