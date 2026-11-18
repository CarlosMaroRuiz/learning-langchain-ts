import { tool, type ToolRuntime } from "langchain";
import { z } from "zod";
import { executeCapability } from "../capability-result.js";
import { defaultAudioPlayer } from "./player.js";

export const reproducirMusicaLocalTool = tool(
  async ({ nombreArchivo }, runtime: ToolRuntime) =>
    executeCapability("music.play", async () => {
      const fileName = nombreArchivo || "iron_music.mp3";
      const result = await defaultAudioPlayer.play(fileName, runtime.signal);

      return {
        status: "succeeded",
        summary: `Reproducción iniciada para ${result.fileName}.`,
        evidence: [
          {
            fileName: result.fileName,
            playerProcessId: result.pid,
            playCommandConfirmed: true,
          },
        ],
        limitations: [
          "Se confirmó que Windows ejecutó Play(); no se puede verificar el volumen o la salida física de audio.",
        ],
        effects: ["suppress_speech"],
      };
    }, runtime.signal),
  {
    name: "reproducir_musica_local",
    description:
      "Reproduce el archivo de música 'iron_music.mp3'. Úsala SIEMPRE que el usuario diga frases de llegada como 'ya llegó papá', 'ya llego papa', 'acabo de llegar', 'ya llegué', o cuando pida poner música o activar el modo Iron Man.",
    schema: z.object({
      nombreArchivo: z
        .string()
        .optional()
        .default("iron_music.mp3")
        .describe("El nombre del archivo MP3 a reproducir (por defecto 'iron_music.mp3')."),
    }),
  }
);

export const detenerMusicaLocalTool = tool(
  async () =>
    executeCapability("music.stop", async () => {
      const stopped = await defaultAudioPlayer.stop();

      return {
        summary: stopped
          ? "La reproducción de música se detuvo."
          : "No había música reproduciéndose; el estado ya está detenido.",
        evidence: [{ playing: false, processStopped: stopped }],
      };
    }),
  {
    name: "detener_musica_local",
    description: "Detiene o apaga la reproducción de la música local que está sonando.",
    schema: z.object({}),
  }
);
