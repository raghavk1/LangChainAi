import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { HfInference } from "@huggingface/inference";
import removeMarkdown from "remove-markdown";

import dotenv from "dotenv";
import { RequestsGetTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

async function main() {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash", // or gemini-2.0-flash if that's what you're using
    apiKey: process.env.GEMINI_API_KEY,
  });
  const hfModel = new HuggingFaceInference({
    model: "Helsinki-NLP/opus-mt-en-hi", // Simplified model
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  //predictor function
  //   const res = await model.predict('probability of getting a 5 when rolled 2 dices')
  //   console.log('result is',res)

  const tools = [new RequestsGetTool()];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
  });

  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    try {
      if (
        message.toLowerCase().includes("weather") ||
        message.includes("http")
      ) {
        const result = await executor.call({ input: message });
        result = removeMarkdown(result)
        return res.json({ reply: result.output });
      } else if (message.toLowerCase().includes("translate")) {
        const textToTranslate = message.replace(/translate/i, "").trim();
        const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

        const data = await hf.translation({
          model: "Helsinki-NLP/opus-mt-en-hi",
          inputs: textToTranslate,
        });
        var translatedText = removeMarkdown(data.translation_text);
        return res.json({ reply: translatedText });

      } else {
        const messages = [new HumanMessage(message)];
        const response = await model.invoke(messages);
        
        return res.json({ reply: removeMarkdown(response.content) });
      }
    } catch (err) {
      console.error("AI Error:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });

  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
}

main().catch((err) => {
  console.error("Server failed to start:", err);
});
