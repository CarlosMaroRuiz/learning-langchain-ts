const LEVEL_PRIORITY = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const currentLevelPriority = () => {
    const envLevel = (process.env.LOG_LEVEL || (process.env.DEBUG ? "debug" : "info")).toLowerCase();
    return LEVEL_PRIORITY[envLevel] ?? LEVEL_PRIORITY.info;
};
export class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    write(level, message, meta) {
        if (LEVEL_PRIORITY[level] < currentLevelPriority())
            return;
        const timestamp = new Date().toISOString();
        const metaString = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
        const line = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]: ${message}${metaString}`;
        if (level === "error") {
            console.error(line);
        }
        else if (level === "warn") {
            console.warn(line);
        }
        else {
            console.log(line);
        }
    }
    debug(message, meta) {
        this.write("debug", message, meta);
    }
    info(message, meta) {
        this.write("info", message, meta);
    }
    warn(message, meta) {
        this.write("warn", message, meta);
    }
    error(message, meta) {
        this.write("error", message, meta);
    }
}
export const createLogger = (context) => new Logger(context);
//# sourceMappingURL=logger.js.map