import { z } from "zod";
export declare const buscarWebTool: import("langchain").DynamicStructuredTool<z.ZodObject<{
    consulta: z.ZodString;
}, z.core.$strip>, {
    consulta: string;
}, {
    consulta: string;
}, string, unknown, "buscar_en_web">;
export declare const abrirPaginaWebTool: import("langchain").DynamicStructuredTool<z.ZodObject<{
    url: z.ZodString;
}, z.core.$strip>, {
    url: string;
}, {
    url: string;
}, string, unknown, "abrir_pagina_web">;
export declare const seguirEnlaceWebTool: import("langchain").DynamicStructuredTool<z.ZodObject<{
    textoEnlace: z.ZodString;
}, z.core.$strip>, {
    textoEnlace: string;
}, {
    textoEnlace: string;
}, string, unknown, "seguir_enlace_web">;
export declare const cerrarNavegadorTool: import("langchain").DynamicStructuredTool<z.ZodObject<{}, z.core.$strip>, Record<string, never>, Record<string, never>, string, unknown, "cerrar_navegador">;
//# sourceMappingURL=browser.d.ts.map