export declare const browserSkill: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    tools: (import("langchain").DynamicStructuredTool<import("zod").ZodObject<{}, import("zod/v4/core").$strip>, Record<string, never>, Record<string, never>, string, unknown, "cerrar_navegador"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{}, import("zod/v4/core").$strip>, Record<string, never>, Record<string, never>, string, unknown, "abrir_navegador"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
        tarea: import("zod").ZodString;
    }, import("zod/v4/core").$strip>, {
        tarea: string;
    }, {
        tarea: string;
    }, string, unknown, "delegar_a_especialista_web">)[];
    handleDirectly: (userText: string, signal?: AbortSignal) => Promise<string | undefined>;
};
export declare const browserFeature: {
    id: string;
    name: string;
    description: string;
    instructions: string;
    tools: (import("langchain").DynamicStructuredTool<import("zod").ZodObject<{}, import("zod/v4/core").$strip>, Record<string, never>, Record<string, never>, string, unknown, "cerrar_navegador"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{}, import("zod/v4/core").$strip>, Record<string, never>, Record<string, never>, string, unknown, "abrir_navegador"> | import("langchain").DynamicStructuredTool<import("zod").ZodObject<{
        tarea: import("zod").ZodString;
    }, import("zod/v4/core").$strip>, {
        tarea: string;
    }, {
        tarea: string;
    }, string, unknown, "delegar_a_especialista_web">)[];
    handleDirectly: (userText: string, signal?: AbortSignal) => Promise<string | undefined>;
};
//# sourceMappingURL=feature.d.ts.map