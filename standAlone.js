//Open AI Version
import { PromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI } from "@langchain/openai"

const OpenAIKey = ''
const llm  = new ChatOpenAI({OpenAIKey})
const standAloneQues = 'given a question, convert it to standalone question. question : {quest} standalone question is:'
const questionPrompt = PromptTemplate.fromTemplate(standAloneQues)
const questionChain = questionPrompt.pipe(llm)

const response = await questionChain.invoke({
    quest : "What are requirements of a system to learn Linux`"
}) 

// Gemini Version

// import { PromptTemplate } from "@langchain/core/prompts";
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import dotenv from "dotenv";

// dotenv.config();

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// const llm = new ChatGoogleGenerativeAI({
//   apiKey: GEMINI_API_KEY,
//   model: "gemini-1.5-flash", // or "gemini-1.5-pro" if you have access
//   temperature: 0.3,
//   maxOutputTokens: 500,
// });

// const standAloneQues = `Given a question, convert it to a standalone version.
// Question: {quest}
// Standalone Question:`;

// const questionPrompt = PromptTemplate.fromTemplate(standAloneQues);
// const questionChain = questionPrompt.pipe(llm);

// const response = await questionChain.invoke({
//   quest: "What are requirements of a system to learn Linux?",
// });

// console.log("🧠 Standalone question:", response.content);
