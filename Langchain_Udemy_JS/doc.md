This file is for the Langchain JS udemy code

### What is inference?
Mobile/Web apps interacting with LLMs for response is referred to as inferencing.

LLM = Brain 🧠
Tool = Hand 🛠️
Agent = Nervous System that tells the brain to use the hand when needed.


The LLM itself doesn’t know how to use tools.
The agent is what gives your LLM a “brain” that can:
decide if a tool should be used, pick which tool to use, parse inputs/outputs, and orchestrate multi-step 
reasoning.


### What's an LLM vs a ChatModel?
Both are "models," but they differ in how they take input and what they're optimized for.

LLM (LLM class) = raw text in, raw text out
Think of it as prompt → response
No special roles, just plain ol’ text

ChatModel (ChatModel or ChatGoogleGenerativeAI) = messages array
You pass in { role: "user", content: "Hey" }, { role: "assistant", content: "Hi" }
It's made for conversational flows (like ChatGPT)


### What the hell is an Agent?
An agent is a reasoning engine powered by an LLM/chat model that can:
Understand goals from prompts
Decide which tools to use (APIs, functions, scrapers, etc.)
Execute them in steps
Return the final answer
It’s like strapping a brain onto your LLM. 💥




