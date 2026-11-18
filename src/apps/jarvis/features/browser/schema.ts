import { z } from "zod";
import { capabilityResultSchema } from "../capability-result.js";

export const webSourceSchema = z.object({
  title: z.string().describe("Título de la página consultada."),
  url: z.string().url().describe("URL pública de la página que se abrió y leyó."),
  evidence: z.string().describe("Dato concreto de esa página que apoya el resumen."),
});

export const webFindingsSchema = z.object({
  status: z
    .enum(["succeeded", "partial"])
    .describe("Indica si la tarea web se completó o solo parcialmente."),
  summary: z.string().describe("Respuesta directa y concisa a la tarea delegada."),
  sources: z
    .array(webSourceSchema)
    .max(5)
    .describe("Fuentes que se abrieron y leyeron; no incluyas resultados vistos solo en el buscador."),
  limitations: z.string().describe("Limitaciones o incertidumbre; cadena vacía si no aplica."),
});

export const webResearchResultSchema = capabilityResultSchema.extend({
  capability: z.literal("web.research"),
  evidence: z.array(webSourceSchema),
});

export const investigarWebSchema = z.object({
  tarea: z.string().min(2).max(2_000).describe("La tarea de navegación solicitada por el usuario."),
});
