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
import multer from "multer";
import fs from "fs";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";

dotenv.config();

const upload = multer({ dest: "uploads/" }); // file stored temporarily

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
    chatHistory: new ChatMessageHistory(),
    returnMessages: true,
    memoryKey: "chat_history",
  });

  // Create LangChain agent
  const agent = await createReactAgent({
    llm: model,
    tools: [weatherTool],
    systemInstructions: "You are a helpful assistant.",
    verbose: true,
    callbacks: [],
    maxIterations: 5,
    memory: memory,
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    await memory.saveContext({ input: message }, {});
    const chat_history = await memory.loadMemoryVariables();
    const history = chat_history.chat_history || [];

    const result = await agent.invoke({
      messages: [
        ...history,
        { role: "user", content: message },
      ],
    });

    const aiMessage = result.messages.find(msg => msg._getType?.() === "ai");
    await memory.saveContext({}, { output: aiMessage.content });

    return res.json({ reply: aiMessage.content });
  });

  // 📥 Upload endpoint

  app.listen(PORT, () =>
    console.log(`🔥 Gemini-powered agent running at http://localhost:${PORT}`)
  );
}
app.post("/api/upload", upload.single("file"), async (req, res) => {
  console.log("📥 File upload received:", req.file);
  try {
    const filePath = req.file.path;

    // use TextLoader instead of PDFLoader
    const loader = new TextLoader(filePath);
    const docs = await loader.load();

    console.log("✅ Text file content:", docs.slice(0, 1));

    fs.unlinkSync(filePath); // optional cleanup

    return res.status(200).send("✅ File uploaded and processed successfully.");
  } catch (error) {
    console.error("❌ File upload error:", error);
    return res.status(500).send("❌ Failed to process file.");
  }
});

main().catch((err) => {
  console.error("Server failed to start:", err);
});
