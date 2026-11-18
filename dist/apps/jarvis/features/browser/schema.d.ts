import { z } from "zod";
export declare const webSourceSchema: z.ZodObject<{
    title: z.ZodString;
    url: z.ZodString;
    evidence: z.ZodString;
}, z.core.$strip>;
export declare const webFindingsSchema: z.ZodObject<{
    status: z.ZodEnum<{
        partial: "partial";
        succeeded: "succeeded";
    }>;
    summary: z.ZodString;
    sources: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        url: z.ZodString;
        evidence: z.ZodString;
    }, z.core.$strip>>;
    limitations: z.ZodString;
}, z.core.$strip>;
export declare const webResearchResultSchema: z.ZodObject<{
    type: z.ZodLiteral<"capability_result">;
    status: z.ZodEnum<{
        failed: "failed";
        partial: "partial";
        succeeded: "succeeded";
    }>;
    summary: z.ZodString;
    limitations: z.ZodArray<z.ZodString>;
    effects: z.ZodOptional<z.ZodArray<z.ZodString>>;
    capability: z.ZodLiteral<"web.research">;
    evidence: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        url: z.ZodString;
        evidence: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const investigarWebSchema: z.ZodObject<{
    tarea: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=schema.d.ts.map