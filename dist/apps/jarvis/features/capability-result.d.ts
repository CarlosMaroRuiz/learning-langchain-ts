import { z } from "zod";
export declare const capabilityResultSchema: z.ZodObject<{
    type: z.ZodLiteral<"capability_result">;
    capability: z.ZodString;
    status: z.ZodEnum<{
        failed: "failed";
        partial: "partial";
        succeeded: "succeeded";
    }>;
    summary: z.ZodString;
    evidence: z.ZodArray<z.ZodUnknown>;
    limitations: z.ZodArray<z.ZodString>;
    effects: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type CapabilityResult = z.infer<typeof capabilityResultSchema>;
export interface CapabilityOperationResult<Evidence = unknown> {
    status?: "succeeded" | "partial";
    summary: string;
    evidence: Evidence[];
    limitations?: string[];
    effects?: string[];
}
export declare const serializeCapabilityResult: (result: CapabilityResult) => string;
export declare const parseCapabilityResult: (value: unknown) => CapabilityResult | undefined;
export declare const executeCapability: (capability: string, operation: () => Promise<CapabilityOperationResult>, signal?: AbortSignal) => Promise<string>;
//# sourceMappingURL=capability-result.d.ts.map