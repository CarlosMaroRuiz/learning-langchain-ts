import { z } from "zod";

export const ClassificationSchema = z.object({
  department: z
    .enum(["billing", "technical", "general"])
    .describe("El departamento al que pertenece la consulta del cliente."),

  isUrgent: z
    .boolean()
    .describe(
      "True si el usuario reporta caída de producción, pérdida de dinero o bloqueo crítico."
    ),
});

export type TicketClassification = z.infer<typeof ClassificationSchema>;