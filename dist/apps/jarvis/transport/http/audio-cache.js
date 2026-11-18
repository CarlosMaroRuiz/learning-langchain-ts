export class AudioCache {
    cache = new Map();
    maxEntries;
    defaultTtlMs;
    constructor(options = {}) {
        this.maxEntries = options.maxEntries ?? 50;
        this.defaultTtlMs = options.defaultTtlMs ?? 5 * 60_000; // 5 minutos
    }
    set(id, text, ttlMs = this.defaultTtlMs) {
        if (this.cache.has(id)) {
            this.delete(id);
        }
        else if (this.cache.size >= this.maxEntries) {
            // Evict oldest entry
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey)
                this.delete(oldestKey);
        }
        const timer = setTimeout(() => this.delete(id), ttlMs);
        timer.unref();
        this.cache.set(id, { text, timer });
    }
    get(id) {
        return this.cache.get(id)?.text;
    }
    delete(id) {
        const entry = this.cache.get(id);
        if (!entry)
            return false;
        clearTimeout(entry.timer);
        return this.cache.delete(id);
    }
    clear() {
        for (const [id] of this.cache) {
            this.delete(id);
        }
    }
    get size() {
        return this.cache.size;
    }
}
//# sourceMappingURL=audio-cache.js.map