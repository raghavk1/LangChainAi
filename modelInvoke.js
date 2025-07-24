import express from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import { HfInference } from "@huggingface/inference";
import removeMarkdown from "remove-markdown";
import { BufferMemory } from "langchain/memory";
import dotenv from "dotenv";
import { RequestsGetTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import path from "path";
import { fileURLToPath } from "url";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { readFile } from "node:fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { pipeline } from '@xenova/transformers';

const memory = new BufferMemory({
  chatHistory: new ChatMessageHistory(),
  returnMessages: true,
  memoryKey: "chat_history",
});

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_API
);
async function main() {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash", // or gemini-2.0-flash if that's what you're using
    apiKey: process.env.GEMINI_API_KEY,
    memory: memory,
  });
  const hfModel = new HuggingFaceInference({
    model: "Helsinki-NLP/opus-mt-en-hi", // Simplified model
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  const tools = [new RequestsGetTool()];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
  });
  // app.post("/api/chat", async (req, res) => {
  //   const { message } = req.body;

  //   if (!message) {
  //     return res.status(400).json({ error: "No message provided" });
  //   }

  //   try {
  // if (
  //   message.toLowerCase().includes("weather") ||
  //   message.includes("http")
  // ) {
  //   const result = await executor.call({ input: message });
  //   result = removeMarkdown(result)
  //   return res.json({ reply: result.output });
  // } else if (message.toLowerCase().includes("translate")) {
  //       const textToTranslate = message.replace(/translate/i, "").trim();


  //       const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

  //       const data = await hf.translation({
  //         model: "Helsinki-NLP/opus-mt-en-hi",
  //         inputs: textToTranslate,
  //       });
  //       var translatedText = removeMarkdown(data.translation_text);
  //       return res.json({ reply: translatedText });

  //     } else {
  //       const messages = [new HumanMessage(message)];
  //       const response = await model.invoke(messages);

  //       return res.json({ reply: removeMarkdown(response.content) });
  //     }
  //   } catch (err) {
  //     console.error("AI Error:", err);
  //     return res.status(500).json({ error: "Something went wrong" });
  //   }
  // });
  app.post("/api/chat", async (req, res) => {
    console.log(req.body)
    const userMessage = req.body.message;
    if (userMessage == 'upload') {
      await fileUploader()
      console.log('ends')
      // return
    }
    // Load history from memory
    const memoryVars = await memory.loadMemoryVariables({});
    const history = memoryVars.chat_history;

    // Build full message list (history + new input)
    const messages = [
      ...history,
      new HumanMessage(userMessage),
    ];


    if (
      userMessage.toLowerCase().includes("weather") ||
      userMessage.includes("http")
    ) {
      let result = await executor.call({ input: userMessage });
      const finalOutput = removeMarkdown(result.output);

      await memory.saveContext({ input: userMessage }, { output: finalOutput });
      return res.json({ reply: finalOutput });
    } else {
      // Send to model
      const aiResponse = await model.invoke(messages);
      // Save conversation turn
      await memory.saveContext({ input: userMessage }, { output: aiResponse.content });
      res.json({ reply: aiResponse.content });
    }


  });




  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
}
async function fileUploader() {
  console.log("📥 Starting file upload");

  try {
    const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

    const text = await readFile("conversation.txt", "utf-8");

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      separators: ["\n\n", "\n", " "],
      chunkOverlap: 50,
    });

    const docs = await splitter.createDocuments([text]);

    // Create documents with vectors
    const vectorDocs = await Promise.all(
      docs.map(async (doc) => {
        const vector = await extractor(doc.pageContent);
        // Flatten the multi-dimensional array
        const flatEmbedding = vector[0];
        return {
          ...doc,
          metadata: {},
          embedding: flatEmbedding,
        };
      })
    );

    await SupabaseVectorStore.fromDocuments(vectorDocs, null, {
      client: supabase,
      tableName: "documents",
    });

    console.log("✅ Data uploaded successfully to Supabase");
  } catch (err) {
    console.error("❌ Upload failed:", err.message, err.stack);
  }
}

main().catch((err) => {
  console.error("Server failed to start:", err);
});