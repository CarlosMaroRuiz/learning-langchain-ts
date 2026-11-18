export type LogLevel = "debug" | "info" | "warn" | "error";
export declare class Logger {
    readonly context: string;
    constructor(context: string);
    private write;
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
}
export declare const createLogger: (context: string) => Logger;
//# sourceMappingURL=logger.d.ts.map