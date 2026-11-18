import * as z from "zod";
export declare const toolSchema: z.ZodObject<{
    city: z.ZodString;
}, z.core.$strip>;
export type ToolInput = z.infer<typeof toolSchema>;
//# sourceMappingURL=index.d.ts.map