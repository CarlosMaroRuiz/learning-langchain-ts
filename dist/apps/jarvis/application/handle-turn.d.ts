import { type JarvisAgentOptions, type JarvisTurn } from "../agent/assistant.js";
export type JarvisTurnResult = JarvisTurn;
export declare class HandleJarvisTurn {
    private readonly agent;
    execute(userText: string, options?: JarvisAgentOptions): Promise<JarvisTurnResult>;
}
//# sourceMappingURL=handle-turn.d.ts.map