export interface JarvisTurn {
    reply: string;
    musicStarted: boolean;
}
export declare class JarvisAgent {
    private readonly threadId;
    private readonly checkpointer;
    private readonly chatAgent;
    private readonly browserAgent;
    responder(userText: string): Promise<JarvisTurn>;
}
//# sourceMappingURL=agent.d.ts.map