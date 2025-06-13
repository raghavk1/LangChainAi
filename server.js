import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

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
    model: "gemini-2.5-flash-preview-05-20",
    apiKey: process.env.GEMINI_API_KEY,
  });



  // Weather Tool
  const weatherTool = new RequestsGetTool();

  // Create agent with tools
  const agent = await createReactAgent({
    llm: model,
    tools: [weatherTool],
  });

  // Route
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    try {
      const result = await agent.invoke({
        messages: [{ role: "user", content: message }],
      });
      const aiMessage = result.messages.find(msg => msg._getType?.() === "ai");
      const reply = removeMarkdown(aiMessage.content.trim());
      return res.json({ reply });
    } catch (err) {
      console.error("Agent Error:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });

  app.listen(PORT, () =>
    console.log(`🔥 Gemini-powered agent running at http://localhost:${PORT}`)
  );
}

main().catch((err) => {
  console.error("Server failed to start:", err);
});