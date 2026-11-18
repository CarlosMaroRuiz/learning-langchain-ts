export interface JarvisTurn {
    reply: string;
    suppressSpeech: boolean;
    musicStarted: boolean;
}
export type JarvisProgressEvent = {
    type: "delta";
    text: string;
} | {
    type: "status";
    message: string;
} | {
    type: "reset";
};
export interface JarvisAgentOptions {
    signal?: AbortSignal;
    onProgress?: (event: JarvisProgressEvent) => void;
}
export declare class JarvisAgent {
    private readonly threadId;
    private readonly checkpointer;
    private readonly agent;
    responder(userText: string, options?: JarvisAgentOptions): Promise<JarvisTurn>;
}
//# sourceMappingURL=assistant.d.ts.map