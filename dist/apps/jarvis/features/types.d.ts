import type { StructuredToolInterface } from "@langchain/core/tools";
export interface JarvisSkill {
    id: string;
    name: string;
    description: string;
    instructions: string;
    tools: readonly StructuredToolInterface[];
    /**
     * Atajo opcional de ejecución directa para órdenes deterministas de alta velocidad (fast-path).
     * Si devuelve undefined, la solicitud fluye al agente principal de forma natural.
     */
    handleDirectly?(userText: string, signal?: AbortSignal): Promise<string | undefined>;
    beforeTurn?(userText: string): Promise<void>;
    systemPromptSection?: string;
}
export type JarvisFeature = JarvisSkill;
//# sourceMappingURL=types.d.ts.map