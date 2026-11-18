import { AIMessageChunk } from "@langchain/core/messages";
export const terminalPrintStream = async (stream) => {
    let respuestaCompleta = "";
    for await (const chunk of stream) {
        // Si viene de StringOutputParser es string; si viene directo del modelo es AIMessageChunk
        const text = typeof chunk === "string" ? chunk : chunk.text;
        if (text) {
            process.stdout.write(text);
            respuestaCompleta += text;
        }
    }
    process.stdout.write("\n");
    return respuestaCompleta;
};
//# sourceMappingURL=terminal.js.map