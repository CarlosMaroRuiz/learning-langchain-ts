import type { JarvisSkill } from "../types.js";
import { investigarWebTool } from "./subagent.js";
import {
  abrirNavegadorTool,
  cerrarNavegadorTool,
} from "./tools.js";
import { parseCapabilityResult } from "../capability-result.js";
import { normalizeText } from "../../../../core/utils/text.js";

const isFastOpenRequest = (normalized: string): boolean =>
  /^(?:(?:jarvis|oye)\s+)?(?:por favor\s+)?(?:abrir|abre|abres|abra)\s+(?:el\s+)?(?:navegador|edge)(?:\s+por favor)?$/.test(
    normalized
  );

const isFastCloseRequest = (normalized: string): boolean =>
  /^(?:(?:jarvis|oye)\s+)?(?:por favor\s+)?(?:cerrar|cierra|cierres|cierre)\s+(?:el\s+)?(?:navegador|edge)(?:\s+por favor)?$/.test(
    normalized
  );

const getCapabilityReply = (output: unknown, capability: string): string => {
  const result = parseCapabilityResult(output);
  if (!result || result.capability !== capability) {
    throw new Error("La capacidad del navegador devolvió un resultado inválido.");
  }
  if (result.status === "failed") {
    return `No pude completar esa operación. ${result.limitations.join(" ")}`.trim();
  }

  if (capability === "browser.open") return "Ya abrí el navegador.";
  if (capability === "browser.close") {
    return result.summary.toLowerCase().includes("ya estaba cerrado")
      ? "Veo que el navegador ya estaba cerrado."
      : "Ya cerré el navegador.";
  }

  return result.summary;
};

export const browserSkill = {
  id: "browser",
  name: "Navegación Web con Microsoft Edge",
  description:
    "Abre Microsoft Edge, realiza búsquedas en Bing y lee páginas web públicas.",
  instructions: `REGLAS DE NAVEGACIÓN WEB:
- Si el usuario solicita abrir el navegador sin indicar una búsqueda, usa abrir_navegador.
- Si solicita buscar información, investigar en la web o consultar una página, delega la tarea al especialista web con la herramienta delegar_a_especialista_web.
- Si solicita cerrar el navegador, usa cerrar_navegador.
- Solo navega en páginas públicas; nunca inicies sesión, no llenes formularios ni realices compras.
- Siempre presenta los hallazgos con sus fuentes y limitaciones en primera persona como Jarvis.`,
  tools: [abrirNavegadorTool, investigarWebTool, cerrarNavegadorTool],
  handleDirectly: async (
    userText: string,
    signal?: AbortSignal
  ): Promise<string | undefined> => {
    const normalized = normalizeText(userText);

    if (isFastOpenRequest(normalized)) {
      const output = await abrirNavegadorTool.invoke(
        {},
        signal ? { signal } : undefined
      );
      return getCapabilityReply(output, "browser.open");
    }

    if (isFastCloseRequest(normalized)) {
      const output = await cerrarNavegadorTool.invoke(
        {},
        signal ? { signal } : undefined
      );
      return getCapabilityReply(output, "browser.close");
    }

    // Para cualquier otra consulta de búsqueda o navegación, el LLM la gestiona de forma autónoma
    return undefined;
  },
} satisfies JarvisSkill;

export const browserFeature = browserSkill;
