const limpiarMarkdown = (texto) => texto
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s?)/gm, "")
    .replace(/^\s*(?:[-*+]|\d+[.)])\s+/gm, "")
    .replace(/(\*\*|__|~~|\*|_)/g, "")
    .replace(/\s+/g, " ")
    .trim();
export async function generarAudioKokoroStream(texto, signal) {
    const input = limpiarMarkdown(texto);
    if (!input) {
        throw new Error("No hay texto para generar audio.");
    }
    const request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "kokoro",
            input,
            voice: "em_alex",
            response_format: "mp3",
        }),
    };
    if (signal)
        request.signal = signal;
    const response = await fetch("http://localhost:8880/v1/audio/speech", request);
    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Kokoro respondió ${response.status}: ${details}`);
    }
    if (!response.body) {
        throw new Error("Kokoro no devolvió un flujo de audio.");
    }
    return response.body;
}
//# sourceMappingURL=kokoro.js.map