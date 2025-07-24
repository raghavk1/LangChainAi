// import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/hf";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: "sentence-transformers/paraphrase-MiniLM-L6-v2", // try this one
});
console.log("API KEY:", process.env.HUGGINGFACE_API_KEY);

const res = await embeddings.embedQuery("This is a test");
console.log(res.length); // should log 384