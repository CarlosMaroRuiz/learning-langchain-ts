import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { ClasifierTicket } from "../types/index.js";

export const billingPrompt = ChatPromptTemplate.fromMessages<ClasifierTicket>([
  [
    "system",
    "Eres un especialista en facturación, cobros y reembolsos. El cliente tiene un plan {userPlan}. Responde con claridad, empatía y solicita los datos mínimos necesarios (como ID de transacción o últimos 4 dígitos) para resolver su caso.",
  ],
  ["human", "{message}"],
]);