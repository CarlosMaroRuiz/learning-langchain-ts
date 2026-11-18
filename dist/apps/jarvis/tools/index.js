import { tool } from "langchain";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
let audioProcess = null;
// Asegura que si cierras Jarvis o presionas Ctrl+C, la música se apague también
process.on("exit", () => {
    if (audioProcess) {
        audioProcess.kill();
    }
});
export const reproducirMusicaLocalTool = tool(async ({ nombreArchivo }) => {
    try {
        const filePath = path.resolve(process.cwd(), nombreArchivo || "iron_music.mp3");
        if (!fs.existsSync(filePath)) {
            return `No encontré el archivo ${nombreArchivo} en la carpeta del proyecto.`;
        }
        // Si ya había una canción sonando, la detenemos antes de iniciar la nueva
        if (audioProcess) {
            audioProcess.kill();
            audioProcess = null;
        }
        // Ejecutamos el reproductor nativo de Windows (WPF MediaPlayer) oculto en segundo plano
        const psScript = `
        Add-Type -AssemblyName presentationCore;
        $player = New-Object System.Windows.Media.MediaPlayer;
        $player.Open([Uri]'${filePath.replace(/'/g, "''")}');
        $player.Play();
        while ($true) { Start-Sleep -Milliseconds 500 }
      `;
        audioProcess = spawn("powershell", ["-NoProfile", "-WindowStyle", "Hidden", "-Command", psScript], {
            stdio: "ignore",
        });
        audioProcess.on("exit", () => {
            audioProcess = null;
        });
        return `Reproduciendo ${path.basename(filePath)} en este momento.`;
    }
    catch (error) {
        return `Ocurrió un error al intentar reproducir la música: ${error.message}`;
    }
}, {
    name: "reproducir_musica_local",
    description: "Reproduce el archivo de música 'iron_music.mp3'. Úsala SIEMPRE que el usuario diga frases de llegada como 'ya llegó papá', 'ya llego papa', 'acabo de llegar', 'ya llegué', o cuando pida poner música o activar el modo Iron Man.",
    schema: z.object({
        nombreArchivo: z
            .string()
            .optional()
            .default("iron_music.mp3")
            .describe("El nombre del archivo MP3 a reproducir (por defecto 'iron_music.mp3')."),
    }),
});
export const detenerMusicaLocalTool = tool(async () => {
    if (audioProcess) {
        audioProcess.kill();
        audioProcess = null;
        return "La música ha sido detenida.";
    }
    return "No hay ninguna canción reproduciéndose en este momento.";
}, {
    name: "detener_musica_local",
    description: "Detiene o apaga la reproducción de la música local que está sonando.",
    schema: z.object({}),
});
//# sourceMappingURL=index.js.map