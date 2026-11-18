import * as z from "zod";
export const toolSchema = z.object({
    city: z.string().describe("El nombre de la ciudad, por ejemplo: Tuxtla Gutiérrez, Madrid o Ciudad de México"),
});
//# sourceMappingURL=index.js.map