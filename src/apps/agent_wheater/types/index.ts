import * as z from "zod";

export const toolSchema = z.object({
  city: z.string().describe("El nombre de la ciudad, por ejemplo: Tuxtla Gutiérrez, Madrid o Ciudad de México"),
});

// Extraes el tipo automáticamente desde el esquema de Zod
export type ToolInput = z.infer<typeof toolSchema>;
