export interface AudioCacheOptions {
  maxEntries?: number;
  defaultTtlMs?: number;
}

export class AudioCache {
  private readonly cache = new Map<string, { text: string; timer: NodeJS.Timeout }>();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;

  constructor(options: AudioCacheOptions = {}) {
    this.maxEntries = options.maxEntries ?? 50;
    this.defaultTtlMs = options.defaultTtlMs ?? 5 * 60_000; // 5 minutos
  }

  set(id: string, text: string, ttlMs = this.defaultTtlMs): void {
    if (this.cache.has(id)) {
      this.delete(id);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.delete(oldestKey);
    }

    const timer = setTimeout(() => this.delete(id), ttlMs);
    timer.unref();
    this.cache.set(id, { text, timer });
  }

  get(id: string): string | undefined {
    return this.cache.get(id)?.text;
  }

  delete(id: string): boolean {
    const entry = this.cache.get(id);
    if (!entry) return false;
    clearTimeout(entry.timer);
    return this.cache.delete(id);
  }

  clear(): void {
    for (const [id] of this.cache) {
      this.delete(id);
    }
  }

  get size(): number {
    return this.cache.size;
  }
}
