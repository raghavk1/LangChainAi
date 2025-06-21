import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { BufferMemory } from "langchain/memory";

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

  const memory = new BufferMemory({
    chatHistory: new ChatMessageHistory(), // Stores messages in RAM
    returnMessages: true, // Return whole message list to agent
    memoryKey: "chat_history"
  });

  // Create agent with tools
  const agent = await createReactAgent({
    llm: model,
    tools: [weatherTool],
    systemInstructions: "You are a helpful assistant.", // 🧠 Prompt prefix
    verbose: true,                // 🪵 Logs what's happening inside
    callbacks: [],                // 📞 LangChain callbacks (for streaming, tracing)
    maxIterations: 5,             // 🔁 Tool use + reasoning loop limit
    memory: memory,               // 🧠 You can attach memory (optional)
  });

  // Route
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
  
    // Store user's message:
    await memory.saveContext({ input: message }, {});
  
    // Get full chat history:
    const chat_history = await memory.loadMemoryVariables();
    const history = chat_history.chat_history || [];
  
    // Run agent with full history:
    const result = await agent.invoke({
      messages: [
        ...history,
        { role: "user", content: message }
      ],
    });
  
    // Store assistant reply:
    const aiMessage = result.messages.find(msg => msg._getType?.() === "ai");
    await memory.saveContext({}, { output: aiMessage.content });
  
    return res.json({ reply: aiMessage.content });
  });

  app.listen(PORT, () =>
    console.log(`🔥 Gemini-powered agent running at http://localhost:${PORT}`)
  );
}

main().catch((err) => {
  console.error("Server failed to start:", err);
});