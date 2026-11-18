import { z } from "zod";
export declare const reproducirMusicaLocalTool: import("langchain").DynamicStructuredTool<z.ZodObject<{
    nombreArchivo: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>, {
    nombreArchivo: string;
}, {
    nombreArchivo?: string | undefined;
}, string, unknown, "reproducir_musica_local">;
export declare const detenerMusicaLocalTool: import("langchain").DynamicStructuredTool<z.ZodObject<{}, z.core.$strip>, Record<string, never>, Record<string, never>, string, unknown, "detener_musica_local">;
//# sourceMappingURL=tools.d.ts.map