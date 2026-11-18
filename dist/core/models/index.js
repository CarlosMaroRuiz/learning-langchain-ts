import "dotenv/config";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatOllama } from "@langchain/ollama";
import { ChatGoogle } from "@langchain/google";
/**
 * Instancia ligera del modelo de lenguaje configurada con DeepSeek.
 *
 * Parámetros principales:
 *
 * @param {string} model - Identificador del modelo a utilizar en la API de DeepSeek.
 *   - "deepseek-flash": Modelo rápido y económico (familia V4.1) ideal para tareas
 *     generales, chat en tiempo real, RAG y uso de herramientas (tool calling).
 *   - "deepseek-v4-pro": Modelo orientado a razonamiento profundo, lógica compleja
 *     y agentes de múltiples pasos.
 *
 * @param {number} temperature - Controla la aleatoriedad o "creatividad" de las respuestas.
 *   El rango va de 0 a 2 (usualmente se trabaja entre 0 y 1):
 *   - 0.0: Determinista y preciso. El modelo elige siempre las palabras más probables.
 *          Ideal para extracción de datos (JSON/Zod), código, matemáticas o RAG estricto.
 *   - 0.5 - 0.7: Equilibrio entre coherencia y variedad natural. Recomendado para
 *                chatbots conversacionales y asistentes generales.
 *   - 1.0 o más: Muy creativo y variado, pero con mayor riesgo de inventar datos (alucinaciones).
 *                Útil para lluvia de ideas o escritura creativa.
 *
 * Nota: La clave `DEEPSEEK_API_KEY` se carga automáticamente desde las variables de entorno
 * gracias a la importación de `"dotenv/config"` en la primera línea.
 */
export const modelLite = new ChatDeepSeek({
    model: "deepseek-flash",
    temperature: 0.7,
});
export const modelLocal = new ChatOllama({
    model: "qwen3:8b",
    temperature: 0,
    baseUrl: "http://localhost:11434",
});
export const modelGoogle = new ChatGoogle({
    model: "gemini-3.1-flash-lite",
    temperature: 0,
});
//# sourceMappingURL=index.js.map