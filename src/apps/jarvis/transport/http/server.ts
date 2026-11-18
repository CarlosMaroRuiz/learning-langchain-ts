import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HandleJarvisTurn } from "../../application/handle-turn.js";
import { AudioCache } from "./audio-cache.js";
import {
  handleServeUI,
  handleStreamAudio,
  handleChatTurn,
  sendNotFound,
} from "./handlers.js";
import { sendJson } from "./request.js";
import { createLogger } from "../../../../core/utils/logger.js";

const PORT = 3000;
const logger = createLogger("JarvisServer");

export const startJarvisServer = async (): Promise<void> => {
  const uiCandidates = [
    fileURLToPath(new URL("../../ui.html", import.meta.url)),
    path.resolve(process.cwd(), "src", "apps", "jarvis", "ui.html"),
  ];
  const uiPath = uiCandidates.find((candidate) => existsSync(candidate));
  if (!uiPath) {
    throw new Error("No se encontró src/apps/jarvis/ui.html.");
  }

  const html = await readFile(uiPath, "utf8");
  const handleTurn = new HandleJarvisTurn();
  const audioCache = new AudioCache();
  let requestInProgress = false;

  const server = createServer(async (request, response) => {
    const url = request.url ?? "/";

    if (request.method === "GET" && url === "/") {
      return handleServeUI(response, html);
    }

    const audioMatch = url.match(/^\/api\/audio\/([a-f0-9-]+)$/);
    if (request.method === "GET" && audioMatch) {
      const audioId = audioMatch[1];
      if (!audioId) {
        sendNotFound(response);
        return;
      }
      return handleStreamAudio(request, response, audioId, audioCache);
    }

    const isStreaming = url === "/api/chat/stream";
    if (request.method === "POST" && (url === "/api/chat" || isStreaming)) {
      if (requestInProgress) {
        sendJson(response, 409, { error: "Jarvis ya está procesando otro mensaje." });
        return;
      }

      requestInProgress = true;
      try {
        await handleChatTurn(request, response, { handleTurn, audioCache, isStreaming });
      } finally {
        requestInProgress = false;
      }
      return;
    }

    sendNotFound(response);
  });

  await new Promise<void>((resolve, reject) => {
    const handleError = (error: Error) => reject(error);
    server.once("error", handleError);
    server.listen(PORT, "127.0.0.1", () => {
      server.off("error", handleError);
      resolve();
    });
  });

  logger.info(`Jarvis está listo: http://localhost:${PORT}`);
  console.log(`Jarvis está listo: http://localhost:${PORT}`);
  console.log("Abre el enlace en Chrome o Edge y permite el acceso al micrófono.");
  await new Promise<void>((resolve) => server.once("close", resolve));
};
