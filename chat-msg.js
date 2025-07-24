//chat + history 

import express from "express";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferMemory } from "langchain/memory";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { RequestsGetTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = 3001;

// 🔮 Set up Gemini Chat Model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

// 🧠 Memory store
const memory = new BufferMemory({
  chatHistory: new ChatMessageHistory(),
  returnMessages: true,
  memoryKey: "chat_history",
});

  const tools = [new RequestsGetTool()];

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "zero-shot-react-description",
    verbose: true,
  });

// 🧠 Simple memory-based chat route
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
    
  // Load history from memory
  const memoryVars = await memory.loadMemoryVariables({});
  const history = memoryVars.chat_history;

  // Build full message list (history + new input)
  const messages = [
    ...history,
    new HumanMessage(userMessage),
  ];

  // Send to model
  const aiResponse = await model.invoke(messages);
  console.log(messages,'----->', aiResponse)
  // Save conversation turn
  await memory.saveContext({ input: userMessage }, { output: aiResponse.content });

  res.json({ reply: aiResponse.content });
});

app.listen(PORT, () => {
  console.log(`🔥 Memory Chat running at http://localhost:${PORT}`);
});
