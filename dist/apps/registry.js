import ChatMemoryApp from "./chatMemory/index.js";
import AgentWeatherApp from "./agent_wheater/index.js";
import RunnableContratoLab from "./llmAppV1/index.js";
import PipeTransformLab from "./PipeTrasformLab/index.js";
import LogPipeLineChallege from "./LogPipelineChallenge/index.js";
import JarvisApp from "./jarvis/index.js";
/**
 * Registro central de apps disponibles en el menú.
 * Para agregar una app nueva: impórtala y añade una entrada aquí.
 */
export const apps = [
    {
        id: "chat-memory",
        name: "Chat Memory",
        description: "Prueba de memoria conversacional con LangChain.",
        run: ChatMemoryApp,
    },
    {
        id: "agent-weather",
        name: "Agent Weather",
        description: "Agente para obtener información del clima.",
        run: AgentWeatherApp,
    },
    {
        id: "runnable-lab",
        name: "Runnable Contrato Lab",
        description: "Laboratorio práctico de Runnable<RunInput, RunOutput>, stream, batch y withConfig.",
        run: RunnableContratoLab,
    },
    {
        id: "pipe-transform-lab",
        name: "Pipe Transform Lab",
        description: "Radiografía paso a paso de cómo se transforman los datos en un .pipe().",
        run: PipeTransformLab,
    },
    {
        id: "log-pipeline-challenge",
        name: "Log Pipeline Challenge",
        description: "Auditoría y diagnóstico de logs en lote usando Runnables personalizados y withConfig.",
        run: LogPipeLineChallege,
    },
    {
        id: "jarvis",
        name: "Jarvis Assistant",
        description: "Asistente web local con micrófono, voz Kokoro, música y búsqueda web en Edge.",
        run: JarvisApp,
    },
];
//# sourceMappingURL=registry.js.map