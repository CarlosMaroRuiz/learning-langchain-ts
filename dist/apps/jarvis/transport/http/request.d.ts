import type { IncomingMessage, ServerResponse } from "node:http";
export declare class RequestError extends Error {
    readonly statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare const readChatMessage: (request: IncomingMessage) => Promise<string>;
export declare const sendJson: (response: ServerResponse, statusCode: number, payload: Record<string, string>) => void;
//# sourceMappingURL=request.d.ts.map