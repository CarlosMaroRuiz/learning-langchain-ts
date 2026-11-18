import { ChatPromptTemplate } from "@langchain/core/prompts";

export const vipPrompt = ChatPromptTemplate.fromMessages<{
  department: string;
  userPlan: string;
  message: string;
}>([
  [
    "system",
    "Eres un ingeniero de soporte técnico VIP para clientes con plan {userPlan}. Responde con tono prioritario, empático y garantiza un SLA de respuesta de 15 minutos.",
  ],
  [
    "human",
    "Departamento afectado: {department}\nReporte del cliente: {message}",
  ],
]);