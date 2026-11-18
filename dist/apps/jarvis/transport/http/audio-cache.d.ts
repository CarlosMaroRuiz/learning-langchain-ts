export interface AudioCacheOptions {
    maxEntries?: number;
    defaultTtlMs?: number;
}
export declare class AudioCache {
    private readonly cache;
    private readonly maxEntries;
    private readonly defaultTtlMs;
    constructor(options?: AudioCacheOptions);
    set(id: string, text: string, ttlMs?: number): void;
    get(id: string): string | undefined;
    delete(id: string): boolean;
    clear(): void;
    get size(): number;
}
//# sourceMappingURL=audio-cache.d.ts.map