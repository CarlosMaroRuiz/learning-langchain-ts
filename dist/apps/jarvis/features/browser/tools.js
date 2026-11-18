import { tool } from "langchain";
import { z } from "zod";
import { executeCapability } from "../capability-result.js";
import { defaultBrowserSession } from "./session.js";
export const buscarWebTool = tool(async ({ consulta }, runtime) => executeCapability("browser.search", async () => {
    return defaultBrowserSession.search(consulta, runtime.signal);
}, runtime.signal), {
    name: "buscar_en_web",
    description: "Busca información pública en la web usando el navegador local de Microsoft Edge. Devuelve títulos, enlaces y resúmenes; no inicia sesión ni envía formularios.",
    schema: z.object({
        consulta: z.string().min(2).max(500).describe("Texto que se debe buscar en la web."),
    }),
});
export const abrirPaginaWebTool = tool(async ({ url }, runtime) => executeCapability("browser.open_page", async () => {
    const evidence = await defaultBrowserSession.navigate(url, runtime.signal);
    return {
        summary: `Se abrió y leyó la página ${evidence.title || evidence.url}.`,
        evidence: [evidence],
    };
}, runtime.signal), {
    name: "abrir_pagina_web",
    description: "Abre una URL HTTP/HTTPS pública en la ventana visible de Edge y lee el texto principal de la página. No acepta direcciones locales ni privadas.",
    schema: z.object({
        url: z.string().url().describe("Dirección HTTP/HTTPS pública que se debe abrir."),
    }),
});
export const seguirEnlaceWebTool = tool(async ({ textoEnlace }, runtime) => executeCapability("browser.follow_link", async () => {
    const evidence = await defaultBrowserSession.followLink(textoEnlace, runtime.signal);
    return {
        summary: `Se abrió el enlace ${evidence.title || evidence.url}.`,
        evidence: [evidence],
    };
}, runtime.signal), {
    name: "seguir_enlace_web",
    description: "Navega a un enlace de la página actual que coincida con el texto indicado y devuelve su contenido. No activa botones ni envía formularios.",
    schema: z.object({
        textoEnlace: z.string().min(1).max(200).describe("Texto visible del enlace que se debe abrir."),
    }),
});
export const cerrarNavegadorTool = tool(async () => executeCapability("browser.close", async () => {
    const wasOpen = await defaultBrowserSession.close();
    return {
        summary: wasOpen
            ? "Se cerró la ventana de navegación de Jarvis."
            : "El navegador ya estaba cerrado.",
        evidence: [{ browserClosed: true, wasOpen }],
    };
}), {
    name: "cerrar_navegador",
    description: "Cierra la ventana de Microsoft Edge abierta por las herramientas web de Jarvis.",
    schema: z.object({}),
});
export const abrirNavegadorTool = tool(async (_input, runtime) => executeCapability("browser.open", async () => {
    const page = await defaultBrowserSession.getPage();
    if (runtime.signal?.aborted) {
        await defaultBrowserSession.close();
        throw runtime.signal.reason ?? new Error("La apertura del navegador fue cancelada.");
    }
    return {
        summary: "Se abrió una ventana visible de Microsoft Edge para Jarvis.",
        evidence: [{ browser: "Microsoft Edge", visible: true, pageUrl: page.url() }],
    };
}, runtime.signal), {
    name: "abrir_navegador",
    description: "Abre una ventana visible de Microsoft Edge sin realizar búsquedas ni navegar a una página.",
    schema: z.object({}),
});
//# sourceMappingURL=tools.js.map