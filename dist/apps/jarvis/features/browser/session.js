import { Buffer } from "node:buffer";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { chromium } from "playwright";
import { createLogger } from "../../../../core/utils/logger.js";
const logger = createLogger("BrowserSession");
export const MAX_PAGE_TEXT = 10_000;
export const SAFE_SEARCH_URL = "https://www.bing.com/search";
export class BrowserSession {
    browser;
    currentPage;
    hostSafetyCache = new Map();
    maxCacheEntries = 100;
    isPrivateIp(address) {
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
            return this.isPrivateIp(normalized.slice("::ffff:".length));
        }
        return (normalized === "::" ||
            normalized === "::1" ||
            normalized.startsWith("fc") ||
            normalized.startsWith("fd") ||
            /^fe[89ab]/.test(normalized));
    }
    async isHostPublic(hostname) {
        const cached = this.hostSafetyCache.get(hostname);
        if (cached)
            return cached;
        if (this.hostSafetyCache.size >= this.maxCacheEntries) {
            const oldestKey = this.hostSafetyCache.keys().next().value;
            if (oldestKey)
                this.hostSafetyCache.delete(oldestKey);
        }
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
                return !this.isPrivateIp(normalized);
            try {
                const addresses = await lookup(normalized, { all: true, verbatim: true });
                return addresses.length > 0 && addresses.every(({ address }) => !this.isPrivateIp(address));
            }
            catch {
                return false;
            }
        })();
        this.hostSafetyCache.set(hostname, check);
        return check;
    }
    async validatePublicUrl(value) {
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
            !(await this.isHostPublic(url.hostname))) {
            return undefined;
        }
        return url;
    }
    async filterPrivateRequests(route) {
        if (await this.validatePublicUrl(route.request().url())) {
            await route.continue();
        }
        else {
            await route.abort("blockedbyclient");
        }
    }
    async getPage() {
        if (this.browser?.isConnected() && this.currentPage && !this.currentPage.isClosed()) {
            return this.currentPage;
        }
        await this.close();
        logger.info("Iniciando instancia visible de Microsoft Edge");
        this.browser = await chromium.launch({ channel: "msedge", headless: false });
        const active = this.browser;
        active.once("disconnected", () => {
            if (this.browser === active) {
                this.browser = undefined;
                this.currentPage = undefined;
            }
        });
        const context = await active.newContext({ acceptDownloads: false });
        this.currentPage = await context.newPage();
        await this.currentPage.route("**/*", (route) => this.filterPrivateRequests(route));
        return this.currentPage;
    }
    async close() {
        const active = this.browser;
        this.browser = undefined;
        this.currentPage = undefined;
        if (!active?.isConnected())
            return false;
        logger.info("Cerrando instancia de navegador");
        await active.close();
        return true;
    }
    async navigate(address, signal) {
        const page = await this.getPage();
        const abortPage = () => {
            if (this.currentPage === page)
                this.currentPage = undefined;
            void page.close().catch((err) => {
                logger.error("No se pudo cerrar página cancelada", { error: String(err) });
            });
        };
        signal?.addEventListener("abort", abortPage, { once: true });
        try {
            if (signal?.aborted) {
                throw signal.reason ?? new Error("La navegación fue cancelada.");
            }
            const url = await this.validatePublicUrl(address);
            if (!url) {
                throw new Error("Solo se permiten páginas HTTP/HTTPS públicas.");
            }
            await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 25_000 });
            const finalUrl = await this.validatePublicUrl(page.url());
            if (!finalUrl) {
                throw new Error("La página redirigió a una dirección no permitida.");
            }
            const title = await page.title();
            const text = (await page.locator("body").innerText({ timeout: 8_000 })).trim();
            return {
                title,
                url: finalUrl.href,
                content: text.slice(0, MAX_PAGE_TEXT),
            };
        }
        finally {
            signal?.removeEventListener("abort", abortPage);
        }
    }
    async search(consulta, signal) {
        const page = await this.getPage();
        const searchUrl = new URL(SAFE_SEARCH_URL);
        searchUrl.searchParams.set("q", consulta);
        const searchPage = await this.navigate(searchUrl.href, signal);
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
            return {
                status: "partial",
                summary: "El buscador no devolvió resultados estructurados.",
                evidence: [searchPage],
                limitations: ["No fue posible verificar resultados individuales."],
            };
        }
        return {
            summary: `El buscador devolvió ${validResults.length} resultados.`,
            evidence: validResults,
        };
    }
    async followLink(textoEnlace, signal) {
        const page = await this.getPage();
        const link = page.locator("a").filter({ hasText: textoEnlace }).first();
        if ((await link.count()) === 0) {
            throw new Error(`No encontré un enlace con el texto "${textoEnlace}" en la página actual.`);
        }
        const href = await link.getAttribute("href");
        if (!href)
            throw new Error("El enlace seleccionado no tiene una dirección de destino.");
        const target = new URL(href, page.url());
        return this.navigate(target.href, signal);
    }
    isOpen() {
        return Boolean(this.browser?.isConnected());
    }
    dispose() {
        this.hostSafetyCache.clear();
        void this.close();
    }
}
// Instancia singleton compartida por defecto
export const defaultBrowserSession = new BrowserSession();
//# sourceMappingURL=session.js.map