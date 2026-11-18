import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { generarAudioKokoroStream } from "../../features/speech/kokoro.js";
import { RequestError, readChatMessage, sendJson } from "./request.js";
import { createLogger } from "../../../../core/utils/logger.js";
const logger = createLogger("JarvisHTTP");
export const sendNotFound = (response) => {
    response.writeHead(404);
    response.end("No encontrado");
};
export const sendStreamEvent = (response, event) => {
    if (!response.destroyed && !response.writableEnded) {
        response.write(`${JSON.stringify(event)}\n`);
    }
};
const esperarDrain = (response) => new Promise((resolve, reject) => {
    const cleanup = () => {
        response.off("drain", onDrain);
        response.off("close", onClose);
    };
    const onDrain = () => {
        cleanup();
        resolve();
    };
    const onClose = () => {
        cleanup();
        reject(new Error("El cliente cerró el flujo de audio."));
    };
    response.once("drain", onDrain);
    response.once("close", onClose);
});
export const handleServeUI = (response, html) => {
    response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": "text/html; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
    });
    response.end(html);
};
export const handleStreamAudio = async (request, response, audioId, audioCache) => {
    const text = audioCache.get(audioId);
    if (!text) {
        response.writeHead(404);
        response.end("Audio no disponible");
        return;
    }
    const audioController = new AbortController();
    const abortAudio = () => {
        if (!audioController.signal.aborted) {
            audioController.abort(new Error("El cliente canceló la reproducción."));
        }
    };
    const abortOnResponseClose = () => {
        if (!response.writableEnded)
            abortAudio();
    };
    request.once("aborted", abortAudio);
    response.once("close", abortOnResponseClose);
    try {
        const audio = await generarAudioKokoroStream(text, audioController.signal);
        response.writeHead(200, {
            "Cache-Control": "no-store",
            "Content-Type": "audio/mpeg",
            "X-Content-Type-Options": "nosniff",
        });
        const reader = audio.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                if (value && !response.write(Buffer.from(value))) {
                    await esperarDrain(response);
                }
            }
        }
        finally {
            reader.releaseLock();
        }
        response.end();
    }
    catch (error) {
        if (audioController.signal.aborted) {
            if (!response.destroyed && !response.writableEnded)
                response.end();
        }
        else {
            const message = error instanceof Error ? error.message : String(error);
            logger.error("No se pudo transmitir el audio", { error: message });
            if (response.headersSent) {
                response.destroy();
            }
            else {
                sendJson(response, 502, { error: message });
            }
        }
    }
    finally {
        request.off("aborted", abortAudio);
        response.off("close", abortOnResponseClose);
    }
};
export const handleChatTurn = async (request, response, options) => {
    const { handleTurn, audioCache, isStreaming } = options;
    const abortController = new AbortController();
    const abortOnDisconnect = () => {
        if (!abortController.signal.aborted) {
            abortController.abort(new Error("El cliente canceló la solicitud."));
        }
    };
    const abortOnResponseClose = () => {
        if (!response.writableEnded)
            abortOnDisconnect();
    };
    request.once("aborted", abortOnDisconnect);
    response.once("close", abortOnResponseClose);
    try {
        const userText = await readChatMessage(request);
        if (abortController.signal.aborted) {
            throw abortController.signal.reason ?? new Error("La solicitud fue cancelada.");
        }
        if (isStreaming) {
            response.writeHead(200, {
                "Cache-Control": "no-store, no-transform",
                "Content-Type": "application/x-ndjson; charset=utf-8",
                "X-Accel-Buffering": "no",
                "X-Content-Type-Options": "nosniff",
            });
            sendStreamEvent(response, {
                type: "status",
                message: "Estoy procesando tu mensaje...",
            });
        }
        const onProgress = isStreaming
            ? (event) => sendStreamEvent(response, event)
            : undefined;
        const turn = await handleTurn.execute(userText, {
            signal: abortController.signal,
            ...(onProgress ? { onProgress } : {}),
        });
        let audioId = "";
        if (!turn.suppressSpeech && !turn.musicStarted) {
            audioId = randomUUID();
            audioCache.set(audioId, turn.reply);
        }
        const result = {
            reply: turn.reply,
            audioId,
            audioWarning: "",
            musicPlaying: turn.musicStarted || turn.suppressSpeech ? "true" : "false",
        };
        if (isStreaming) {
            sendStreamEvent(response, { type: "complete", ...result });
            response.end();
        }
        else {
            sendJson(response, 200, result);
        }
    }
    catch (error) {
        if (abortController.signal.aborted) {
            if (!response.destroyed && !response.writableEnded)
                response.end();
        }
        else {
            const statusCode = error instanceof RequestError ? error.statusCode : 500;
            const message = error instanceof Error ? error.message : "Error inesperado en Jarvis.";
            logger.error("Error procesando el mensaje", { error: message });
            if (isStreaming && response.headersSent) {
                sendStreamEvent(response, { type: "error", message });
                response.end();
            }
            else {
                sendJson(response, statusCode, { error: message });
            }
        }
    }
    finally {
        request.off("aborted", abortOnDisconnect);
        response.off("close", abortOnResponseClose);
    }
};
//# sourceMappingURL=handlers.js.map