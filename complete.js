//-----------------------------------------------
// Imports
//-----------------------------------------------
import express from "express";
import fileUpload from "express-fileupload";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { createClient } from "@supabase/supabase-js";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { BufferMemory } from "langchain/memory";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { RequestsGetTool } from "langchain/tools";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { readFile } from "node:fs/promises";
import cors from "cors";

dotenv.config();

//-----------------------------------------------
// Server Setup
//-----------------------------------------------
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(fileUpload());
app.use(cors());

// Serve static HTML
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

//-----------------------------------------------
// LangChain Config
//-----------------------------------------------

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
  provider: "hf-inference",
});
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API
);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-preview-05-20",
  apiKey: process.env.GEMINI_API_KEY,
});

const memory = new BufferMemory({
  chatHistory: new ChatMessageHistory(),
  returnMessages: true,
  memoryKey: "chat_history",
});
const weatherTool = new RequestsGetTool();

const agent = await createReactAgent({
  llm: model,
  tools: [weatherTool],
  systemInstructions: "You are a helpful assistant.",
  memory: memory,
});

app.post("/api/upload", async (req, res) => {
  try {
    const text = await readFile("conversation.txt", "utf-8");

    if (!text) {
      console.error("📄 File is empty!");
      return res.status(400).send("File is empty!");
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      separators: ["\n\n", "\n", " "],
      chunkOverlap: 50,
    });

    const output = await splitter.createDocuments([text]);
    console.log("📦 Chunks created:", output.length);

    if (!output.length) {
      throw new Error("No chunks generated from input file.");
    }

    await SupabaseVectorStore.fromDocuments(output, embeddings, {
      client: supabase,
      tableName: "documents",
    });

    console.log("✅ Successfully uploaded to vector store");
    res.status(200).send("✅ File uploaded and indexed");
  } catch (err) {
    console.error("❌ Upload failed:", err.message, err.stack);
    res.status(500).send("❌ Upload failed: " + err.message);
  }
});

//-----------------------------------------------
// ✅ 2️⃣ Chat Route — RAG or Fallback
//-----------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).send("❌ Message required");

    console.log("📩 Message:", message);

    const queryEmbedding = await embeddings.embedQuery(message);
    console.log("🧠 Query embedding generated");

    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_count: 5,
    });

    if (error) {
      console.error("❌ Supabase RPC error:", error.message);
      return res.status(500).send("Supabase RPC Error: " + error.message);
    }

    console.log("🔍 Retrieved Matches:", data?.length || 0);

    const topMatch = data?.[0];
    const similarity = topMatch?.similarity || 0;

    let finalPrompt;

    if (similarity >= 0.75) {
      const context = data.map((d) => d.content).join("\n\n");
      finalPrompt = `Use ONLY this context to answer. 
If not found, say "I don't know".

Context:
${context}

Question: ${message}
`;
    } else {
      finalPrompt = message;
      console.log("⚠️ Using fallback prompt");
    }

    await memory.saveContext({ input: message }, {});

    const chat_history = await memory.loadMemoryVariables();
    const history = chat_history.chat_history || [];

    const result = await agent.invoke({
      messages: [...history, { role: "user", content: finalPrompt }],
    });

    const aiMessage = result.messages.find((msg) => msg._getType?.() === "ai");

    await memory.saveContext({}, { output: aiMessage.content });

    res.json({
      reply: aiMessage.content,
      used_rag: similarity >= 0.75,
      similarity,
    });
  } catch (err) {
    console.error("❌ Chat error:", err.message, err.stack);
    res.status(500).send("❌ Chat failed: " + err.message);
  }
});

//-----------------------------------------------
// ✅ 3️⃣ Start Server
//-----------------------------------------------
app.listen(PORT, () =>
  console.log(`🚀 RAG Server is running at http://localhost:${PORT}`)
);
