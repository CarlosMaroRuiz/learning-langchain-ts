import { Buffer } from "node:buffer";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { chromium } from "playwright";
import { tool } from "langchain";
import { z } from "zod";
const MAX_PAGE_TEXT = 10_000;
const SAFE_SEARCH_URL = "https://www.bing.com/search";
let browser;
let currentPage;
const hostSafetyCache = new Map();
const esIpPrivada = (address) => {
    if (isIP(address) === 4) {
        const octets = address.split(".").map(Number);
        const first = octets[0] ?? 0;
        const second = octets[1] ?? 0;
        return (first === 0 ||
            first === 10 ||
            first === 127 ||
            (first === 100 && second >= 64 && second <= 127) ||
            (first === 169 && second === 254) ||
            (first === 172 && second >= 16 && second <= 31) ||
            (first === 192 && (second === 0 || second === 168)) ||
            (first === 198 && (second === 18 || second === 19)) ||
            first >= 224);
    }
    const normalized = address.toLowerCase();
    if (normalized.startsWith("::ffff:")) {
        return esIpPrivada(normalized.slice("::ffff:".length));
    }
    return (normalized === "::" ||
        normalized === "::1" ||
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        /^fe[89ab]/.test(normalized));
};
const hostIsPublic = (hostname) => {
    const cached = hostSafetyCache.get(hostname);
    if (cached)
        return cached;
    const check = (async () => {
        const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
        if (!normalized ||
            normalized === "localhost" ||
            normalized.endsWith(".localhost") ||
            normalized.endsWith(".local") ||
            normalized.endsWith(".internal")) {
            return false;
        }
        if (isIP(normalized))
            return !esIpPrivada(normalized);
        try {
            const addresses = await lookup(normalized, { all: true, verbatim: true });
            return addresses.length > 0 && addresses.every(({ address }) => !esIpPrivada(address));
        }
        catch {
            return false;
        }
    })();
    hostSafetyCache.set(hostname, check);
    return check;
};
const urlPublica = async (value) => {
    let url;
    try {
        url = new URL(value);
    }
    catch {
        return undefined;
    }
    if ((url.protocol !== "http:" && url.protocol !== "https:") ||
        url.username ||
        url.password ||
        !(await hostIsPublic(url.hostname))) {
        return undefined;
    }
    return url;
};
const filtrarSolicitudesPrivadas = async (route) => {
    if (await urlPublica(route.request().url())) {
        await route.continue();
    }
    else {
        await route.abort("blockedbyclient");
    }
};
const obtenerPagina = async () => {
    if (browser?.isConnected() && currentPage && !currentPage.isClosed()) {
        return currentPage;
    }
    await cerrarNavegador();
    browser = await chromium.launch({ channel: "msedge", headless: false });
    const launchedBrowser = browser;
    launchedBrowser.once("disconnected", () => {
        if (browser === launchedBrowser) {
            browser = undefined;
            currentPage = undefined;
        }
    });
    const context = await launchedBrowser.newContext({ acceptDownloads: false });
    currentPage = await context.newPage();
    await currentPage.route("**/*", filtrarSolicitudesPrivadas);
    return currentPage;
};
const cerrarNavegador = async () => {
    const activeBrowser = browser;
    browser = undefined;
    currentPage = undefined;
    if (activeBrowser?.isConnected())
        await activeBrowser.close();
};
const navegarA = async (page, address) => {
    const url = await urlPublica(address);
    if (!url) {
        throw new Error("Solo se permiten páginas HTTP/HTTPS públicas.");
    }
    await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const finalUrl = await urlPublica(page.url());
    if (!finalUrl) {
        throw new Error("La página redirigió a una dirección no permitida.");
    }
    const title = await page.title();
    const text = (await page.locator("body").innerText({ timeout: 8_000 })).trim();
    return `Título: ${title}\nURL: ${finalUrl.href}\nContenido:\n${text.slice(0, MAX_PAGE_TEXT)}`;
};
export const buscarWebTool = tool(async ({ consulta }) => {
    const page = await obtenerPagina();
    const searchUrl = new URL(SAFE_SEARCH_URL);
    searchUrl.searchParams.set("q", consulta);
    await navegarA(page, searchUrl.href);
    const rawResults = await page.locator("li.b_algo").evaluateAll((elements) => elements.slice(0, 8).map((element) => {
        const anchor = element.querySelector("h2 a");
        const snippet = element.querySelector(".b_caption p");
        return {
            title: anchor?.innerText.trim() ?? "",
            url: anchor?.href ?? "",
            summary: snippet?.textContent?.trim() ?? "",
        };
    }));
    const results = rawResults.map((result) => {
        try {
            const parsed = new URL(result.url);
            const encodedTarget = parsed.searchParams.get("u");
            if (encodedTarget?.startsWith("a1")) {
                return {
                    ...result,
                    url: Buffer.from(encodedTarget.slice(2), "base64").toString("utf8"),
                };
            }
        }
        catch {
            return { ...result, url: "" };
        }
        return result;
    });
    const validResults = results.filter((result) => result.title && result.url.startsWith("https://"));
    if (validResults.length === 0) {
        const text = (await page.locator("body").innerText()).trim();
        return text.slice(0, MAX_PAGE_TEXT) || "El buscador no devolvió resultados.";
    }
    return JSON.stringify(validResults, null, 2);
}, {
    name: "buscar_en_web",
    description: "Busca información pública en la web usando el navegador local de Microsoft Edge. Devuelve títulos, enlaces y resúmenes; no inicia sesión ni envía formularios.",
    schema: z.object({
        consulta: z.string().min(2).max(500).describe("Texto que se debe buscar en la web."),
    }),
});
export const abrirPaginaWebTool = tool(async ({ url }) => navegarA(await obtenerPagina(), url), {
    name: "abrir_pagina_web",
    description: "Abre una URL HTTP/HTTPS pública en la ventana visible de Edge y lee el texto principal de la página. No acepta direcciones locales ni privadas.",
    schema: z.object({
        url: z.string().url().describe("Dirección HTTP/HTTPS pública que se debe abrir."),
    }),
});
export const seguirEnlaceWebTool = tool(async ({ textoEnlace }) => {
    const page = await obtenerPagina();
    const link = page.locator("a").filter({ hasText: textoEnlace }).first();
    if ((await link.count()) === 0) {
        throw new Error(`No encontré un enlace con el texto "${textoEnlace}" en la página actual.`);
    }
    const href = await link.getAttribute("href");
    if (!href)
        throw new Error("El enlace seleccionado no tiene una dirección de destino.");
    const target = new URL(href, page.url());
    return navegarA(page, target.href);
}, {
    name: "seguir_enlace_web",
    description: "Navega a un enlace de la página actual que coincida con el texto indicado y devuelve su contenido. No activa botones ni envía formularios.",
    schema: z.object({
        textoEnlace: z.string().min(1).max(200).describe("Texto visible del enlace que se debe abrir."),
    }),
});
export const cerrarNavegadorTool = tool(async () => {
    await cerrarNavegador();
    return "Se cerró la ventana de navegación de Jarvis.";
}, {
    name: "cerrar_navegador",
    description: "Cierra la ventana de Microsoft Edge abierta por las herramientas web de Jarvis.",
    schema: z.object({}),
});
//# sourceMappingURL=browser.js.map