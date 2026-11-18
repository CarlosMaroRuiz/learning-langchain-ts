export declare const musicSkill: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    tools: (import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
        nombreArchivo: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodString>>;
    }, import("zod/v4/core").$strip>, {
        nombreArchivo: string;
    }, {
        nombreArchivo?: string | undefined;
    }, string, unknown, "reproducir_musica_local"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{}, import("zod/v4/core").$strip>, Record<string, never>, Record<string, never>, string, unknown, "detener_musica_local">)[];
    handleDirectly: (userText: string, signal?: AbortSignal) => Promise<string | undefined>;
};
export declare const musicFeature: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    tools: (import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
        nombreArchivo: import("zod").ZodDefault<import("zod").ZodOptional<import("zod").ZodString>>;
    }, import("zod/v4/core").$strip>, {
        nombreArchivo: string;
    }, {
        nombreArchivo?: string | undefined;
    }, string, unknown, "reproducir_musica_local"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{}, import("zod/v4/core").$strip>, Record<string, never>, Record<string, never>, string, unknown, "detener_musica_local">)[];
    handleDirectly: (userText: string, signal?: AbortSignal) => Promise<string | undefined>;
};
//# sourceMappingURL=feature.d.ts.map