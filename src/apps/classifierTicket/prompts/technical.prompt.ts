import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { ClasifierTicket } from "../types/index.js";

export const technicalPrompt = ChatPromptTemplate.fromMessages<ClasifierTicket>([
  [
    "system",
    "Eres un ingeniero de soporte técnico L2. El cliente tiene plan {userPlan}. Diagnostica el problema de forma estructurada y solicita los detalles clave para reproducirlo (mensajes de error, logs, versión o pasos exactos).",
  ],
  ["human", "{message}"],
]);