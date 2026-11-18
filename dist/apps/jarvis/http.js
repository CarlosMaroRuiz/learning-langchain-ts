import { Buffer } from "node:buffer";
const MAX_REQUEST_BYTES = 8_000;
export class RequestError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
export const readChatMessage = async (request) => {
    request.setEncoding("utf8");
    let body = "";
    for await (const chunk of request) {
        body += chunk;
        if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BYTES) {
            throw new RequestError(413, "El mensaje es demasiado largo.");
        }
    }
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch {
        throw new RequestError(400, "El cuerpo de la solicitud debe ser JSON válido.");
    }
    if (typeof parsed !== "object" || parsed === null || !("message" in parsed)) {
        throw new RequestError(400, "Falta el campo message.");
    }
    const message = parsed.message;
    if (typeof message !== "string" || !message.trim()) {
        throw new RequestError(400, "El mensaje no puede estar vacío.");
    }
    return message.trim();
};
export const sendJson = (response, statusCode, payload) => {
    response.writeHead(statusCode, {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
    });
    response.end(JSON.stringify(payload));
};
//# sourceMappingURL=http.js.map