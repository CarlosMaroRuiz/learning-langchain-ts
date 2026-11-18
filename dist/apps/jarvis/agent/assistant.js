import { createAgent, HumanMessage, AIMessage, modelFallbackMiddleware, summarizationMiddleware, } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { randomUUID } from "node:crypto";
import { modelGoogle, modelLite, modelLocal } from "../../../core/models/index.js";
import { createLogger } from "../../../core/utils/logger.js";
import { getAllSkills, getAllTools, prepareSkillsForTurn, } from "../features/registry.js";
import { buildSystemPrompt } from "./system-prompt.js";
import { parseCapabilityResult } from "../features/capability-result.js";
const logger = createLogger("JarvisAgent");
export class JarvisAgent {
    threadId = randomUUID();
    checkpointer = new MemorySaver();
    agent = createAgent({
        model: modelGoogle,
        name: "jarvis",
        tools: getAllTools(),
        systemPrompt: buildSystemPrompt(getAllSkills()),
        middleware: [
            summarizationMiddleware({
                model: modelGoogle,
                trigger: { messages: 15 },
                keep: { messages: 6 },
            }),
            modelFallbackMiddleware(modelLite, modelLocal),
        ],
        checkpointer: this.checkpointer,
    });
    async responder(userText, options = {}) {
        const skills = getAllSkills();
        // 1. Fast-path directo para órdenes deterministas de alta velocidad (sin costo de LLM)
        for (const skill of skills) {
            if (!skill.handleDirectly)
                continue;
            if (options.signal?.aborted) {
                throw options.signal.reason ?? new Error("La solicitud fue cancelada.");
            }
            const directReply = await skill.handleDirectly(userText, options.signal);
            if (options.signal?.aborted) {
                throw options.signal.reason ?? new Error("La solicitud fue cancelada.");
            }
            if (directReply !== undefined) {
                await this.agent.updateState({ configurable: { thread_id: this.threadId } }, { messages: [new HumanMessage(userText), new AIMessage(directReply)] });
                options.onProgress?.({ type: "reset" });
                options.onProgress?.({ type: "delta", text: directReply });
                return { reply: directReply, suppressSpeech: false, musicStarted: false };
            }
        }
        // 2. Ejecución natural autónoma del agente con sus Skills
        await prepareSkillsForTurn(userText);
        const stream = await this.agent.streamEvents({ messages: [new HumanMessage(userText)] }, {
            configurable: { thread_id: this.threadId },
            version: "v3",
            ...(options.signal ? { signal: options.signal } : {}),
        });
        let streamedResponse = "";
        let suppressSpeech = false;
        await Promise.all([
            (async () => {
                for await (const message of stream.messages) {
                    for await (const delta of message.text) {
                        streamedResponse += delta;
                        options.onProgress?.({ type: "delta", text: delta });
                    }
                }
            })(),
            (async () => {
                for await (const call of stream.toolCalls) {
                    logger.info(`Ejecutando herramienta: ${call.name}`, {
                        threadId: this.threadId,
                        tool: call.name,
                    });
                    options.onProgress?.({ type: "reset" });
                    options.onProgress?.({
                        type: "status",
                        message: "Ahorita estoy realizando esa operación...",
                    });
                    const rawOutput = await call.output;
                    const output = typeof rawOutput === "string"
                        ? rawOutput
                        : typeof rawOutput === "object" && rawOutput !== null && "content" in rawOutput
                            ? rawOutput.content
                            : rawOutput;
                    const result = parseCapabilityResult(output);
                    if (result?.effects?.includes("suppress_speech") && result.status !== "failed") {
                        suppressSpeech = true;
                    }
                    options.onProgress?.({
                        type: "status",
                        message: result?.status === "failed"
                            ? "No pude completar esa acción; estoy preparando mi respuesta..."
                            : "Ya terminé esa acción; estoy preparando mi respuesta...",
                    });
                }
            })(),
        ]);
        const finalState = await stream.output;
        const lastMessage = finalState?.messages?.at(-1);
        const lastContent = lastMessage?.content;
        const finalReply = typeof lastContent === "string"
            ? lastContent
            : Array.isArray(lastContent)
                ? lastContent.map((c) => (typeof c === "string" ? c : "text" in c ? c.text : "")).join("")
                : streamedResponse;
        const reply = finalReply || streamedResponse;
        if (!reply) {
            throw new Error("El agente terminó sin producir una respuesta.");
        }
        return { reply, suppressSpeech, musicStarted: suppressSpeech };
    }
}
//# sourceMappingURL=assistant.js.map