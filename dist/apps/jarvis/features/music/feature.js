import { detenerMusicaLocalTool, reproducirMusicaLocalTool } from "./tools.js";
import { normalizeText } from "../../../../core/utils/text.js";
export const musicSkill = {
    id: "music",
    name: "Control de Música Local",
    description: "Reproducción y detención de música local (como 'iron_music.mp3' y bienvenida épica estilo Iron Man).",
    instructions: `REGLAS DE MÚSICA:
- Si el usuario dice "ya llegó papá", "ya llego papa", "acabo de llegar", "llegué a casa" o pide poner música, debes ejecutar la herramienta reproducir_musica_local (con 'iron_music.mp3') y darle una bienvenida épica al estilo Jarvis.
- Si pide detener, pausar, apagar o silenciar la música, ejecuta detener_musica_local.`,
    tools: [reproducirMusicaLocalTool, detenerMusicaLocalTool],
    handleDirectly: async (userText, signal) => {
        const normalized = normalizeText(userText);
        if (normalized === "para la musica" ||
            normalized === "deten la musica" ||
            normalized === "detener musica" ||
            normalized === "apaga la musica") {
            await detenerMusicaLocalTool.invoke({}, signal ? { signal } : undefined);
            return "Música detenida, señor.";
        }
        return undefined;
    },
};
export const musicFeature = musicSkill;
//# sourceMappingURL=feature.js.map