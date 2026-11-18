import { ChatPromptTemplate } from "@langchain/core/prompts";

export const promptBase = ChatPromptTemplate.fromMessages([
[
    "system",
    "Eres un clasificador experto de tickets de soporte analiza el mensaje del usuario y clasificalo"
],[
    "human",
    "{message}"
]
]);