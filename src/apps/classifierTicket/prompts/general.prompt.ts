import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { ClasifierTicket } from "../types/index.js";

export const generalPrompt = ChatPromptTemplate.fromMessages<ClasifierTicket>([
  [
    "system",
    "Eres un especialista de atención al cliente. El usuario tiene un plan {userPlan}. Responde de forma amable, clara y directa sobre dudas generales de la plataforma, configuración de cuenta o navegación.",
  ],
  ["human", "{message}"],
]);