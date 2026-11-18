import { type Page } from "playwright";
export declare const MAX_PAGE_TEXT = 10000;
export declare const SAFE_SEARCH_URL = "https://www.bing.com/search";
export interface PaginaWebEvidencia {
    title: string;
    url: string;
    content: string;
}
export interface SearchResultItem {
    title: string;
    url: string;
    summary: string;
}
export declare class BrowserSession {
    private browser?;
    private currentPage?;
    private readonly hostSafetyCache;
    private readonly maxCacheEntries;
    private isPrivateIp;
    isHostPublic(hostname: string): Promise<boolean>;
    validatePublicUrl(value: string): Promise<URL | undefined>;
    private filterPrivateRequests;
    getPage(): Promise<Page>;
    close(): Promise<boolean>;
    navigate(address: string, signal?: AbortSignal): Promise<PaginaWebEvidencia>;
    search(consulta: string, signal?: AbortSignal): Promise<{
        status?: "succeeded" | "partial";
        summary: string;
        evidence: unknown[];
        limitations?: string[];
    }>;
    followLink(textoEnlace: string, signal?: AbortSignal): Promise<PaginaWebEvidencia>;
    isOpen(): boolean;
    dispose(): void;
}
export declare const defaultBrowserSession: BrowserSession;
//# sourceMappingURL=session.d.ts.map