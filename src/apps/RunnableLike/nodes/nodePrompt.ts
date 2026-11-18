import { ChatPromptTemplate } from "@langchain/core/prompts";
export const nodePrompt = ChatPromptTemplate.fromTemplate(
    "Responde en máximo 2 oraciones cortas a {user} sobre: {msgClean}"
);