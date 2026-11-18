import { z } from "zod";
import { createLogger } from "../../../core/utils/logger.js";

const logger = createLogger("Capability");

export const capabilityResultSchema = z.object({
  type: z.literal("capability_result"),
  capability: z.string().min(1),
  status: z.enum(["succeeded", "partial", "failed"]),
  summary: z.string(),
  evidence: z.array(z.unknown()),
  limitations: z.array(z.string()),
  effects: z.array(z.string()).optional(),
});

export type CapabilityResult = z.infer<typeof capabilityResultSchema>;

export interface CapabilityOperationResult<Evidence = unknown> {
  status?: "succeeded" | "partial";
  summary: string;
  evidence: Evidence[];
  limitations?: string[];
  effects?: string[];
}

export const serializeCapabilityResult = (result: CapabilityResult): string =>
  JSON.stringify(capabilityResultSchema.parse(result));

export const parseCapabilityResult = (value: unknown): CapabilityResult | undefined => {
  if (typeof value !== "string") return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (error) {
    if (error instanceof SyntaxError) return undefined;
    throw error;
  }

  const result = capabilityResultSchema.safeParse(parsed);
  return result.success ? result.data : undefined;
};

export const executeCapability = async (
  capability: string,
  operation: () => Promise<CapabilityOperationResult>,
  signal?: AbortSignal
): Promise<string> => {
  try {
    if (signal?.aborted) {
      throw signal.reason ?? new Error("La operación fue cancelada.");
    }

    const result = await operation();
    if (signal?.aborted) {
      throw signal.reason ?? new Error("La operación fue cancelada.");
    }

    return serializeCapabilityResult({
      type: "capability_result",
      capability,
      status: result.status ?? "succeeded",
      summary: result.summary,
      evidence: result.evidence,
      limitations: result.limitations ?? [],
      effects: result.effects ?? [],
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    const detail = error instanceof Error ? error.message : String(error);
    logger.error(`${capability} falló`, { error: detail });
    return serializeCapabilityResult({
      type: "capability_result",
      capability,
      status: "failed",
      summary: `No se pudo completar la capacidad ${capability}.`,
      evidence: [],
      limitations: [detail],
      effects: [],
    });
  }
};
