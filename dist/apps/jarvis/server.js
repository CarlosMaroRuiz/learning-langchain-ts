import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JarvisAgent } from "./agent.js";
import { RequestError, readChatMessage, sendJson } from "./http.js";
import { generarAudioKokoro } from "./voice.js";
const PORT = 3000;
const audiosPendientes = new Map();
const sendNotFound = (response) => {
    response.writeHead(404);
    response.end("No encontrado");
};
export const startJarvisServer = async () => {
    const uiCandidates = [
        fileURLToPath(new URL("./ui.html", import.meta.url)),
        path.resolve(process.cwd(), "src", "apps", "jarvis", "ui.html"),
    ];
    const uiPath = uiCandidates.find((candidate) => existsSync(candidate));
    if (!uiPath) {
        throw new Error("No se encontró src/apps/jarvis/ui.html.");
    }
    const html = await readFile(uiPath, "utf8");
    const agent = new JarvisAgent();
    let requestInProgress = false;
    const server = createServer(async (request, response) => {
        if (request.method === "GET" && request.url === "/") {
            response.writeHead(200, {
                "Cache-Control": "no-store",
                "Content-Type": "text/html; charset=utf-8",
                "X-Content-Type-Options": "nosniff",
            });
            response.end(html);
            return;
        }
        const audioMatch = request.url?.match(/^\/api\/audio\/([a-f0-9-]+)$/);
        if (request.method === "GET" && audioMatch) {
            const audioId = audioMatch[1];
            const audio = audioId ? audiosPendientes.get(audioId) : undefined;
            if (!audioId || !audio) {
                response.writeHead(404);
                response.end("Audio no disponible");
                return;
            }
            audiosPendientes.delete(audioId);
            response.writeHead(200, {
                "Cache-Control": "no-store",
                "Content-Length": audio.length,
                "Content-Type": "audio/mpeg",
                "X-Content-Type-Options": "nosniff",
            });
            response.end(audio);
            return;
        }
        if (request.method !== "POST" || request.url !== "/api/chat") {
            sendNotFound(response);
            return;
        }
        if (requestInProgress) {
            sendJson(response, 409, { error: "Jarvis ya está procesando otro mensaje." });
            return;
        }
        requestInProgress = true;
        try {
            const userText = await readChatMessage(request);
            const { reply, musicStarted } = await agent.responder(userText);
            let audioId = "";
            let audioWarning = "";
            if (!musicStarted) {
                try {
                    const audio = await generarAudioKokoro(reply);
                    audioId = randomUUID();
                    audiosPendientes.set(audioId, audio);
                    const expiration = setTimeout(() => audiosPendientes.delete(audioId), 60_000);
                    expiration.unref();
                }
                catch (error) {
                    audioWarning = error instanceof Error ? error.message : String(error);
                    console.error("[Jarvis] No se pudo generar el audio:", audioWarning);
                }
            }
            sendJson(response, 200, {
                reply,
                audioId,
                audioWarning,
                musicPlaying: musicStarted ? "true" : "false",
            });
        }
        catch (error) {
            const statusCode = error instanceof RequestError ? error.statusCode : 500;
            const message = error instanceof Error ? error.message : "Error inesperado en Jarvis.";
            console.error("[Jarvis] Error procesando el mensaje:", message);
            sendJson(response, statusCode, { error: message });
        }
        finally {
            requestInProgress = false;
        }
    });
    await new Promise((resolve, reject) => {
        const handleError = (error) => reject(error);
        server.once("error", handleError);
        server.listen(PORT, "127.0.0.1", () => {
            server.off("error", handleError);
            resolve();
        });
    });
    console.log(`Jarvis está listo: http://localhost:${PORT}`);
    console.log("Abre el enlace en Chrome o Edge y permite el acceso al micrófono.");
    await new Promise((resolve) => server.once("close", resolve));
};
//# sourceMappingURL=server.js.map