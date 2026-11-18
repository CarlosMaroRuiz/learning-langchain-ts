import type { IncomingMessage, ServerResponse } from "node:http";
import type { HandleJarvisTurn } from "../../application/handle-turn.js";
import type { AudioCache } from "./audio-cache.js";
export declare const sendNotFound: (response: ServerResponse) => void;
export declare const sendStreamEvent: (response: ServerResponse, event: object) => void;
export declare const handleServeUI: (response: ServerResponse, html: string) => void;
export declare const handleStreamAudio: (request: IncomingMessage, response: ServerResponse, audioId: string, audioCache: AudioCache) => Promise<void>;
export interface ChatHandlerOptions {
    handleTurn: HandleJarvisTurn;
    audioCache: AudioCache;
    isStreaming: boolean;
}
export declare const handleChatTurn: (request: IncomingMessage, response: ServerResponse, options: ChatHandlerOptions) => Promise<void>;
//# sourceMappingURL=handlers.d.ts.map