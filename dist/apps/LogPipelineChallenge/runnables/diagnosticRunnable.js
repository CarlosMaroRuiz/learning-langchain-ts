import { Runnable } from "@langchain/core/runnables";
class DiagnosticRunnable extends Runnable {
    lc_namespace = ["mi_proyecto", "runnables"];
    async invoke(input, _options) {
        const keyWordAttentions = [
            "base de datos",
            "timeout",
            "crítico",
            "critico",
            "fatal",
            "sin espacio en memoria",
            "econnreset"
        ];
        const lowerInput = input.toLowerCase();
        return {
            // 2. Usamos .some() para verificar si alguna palabra clave está dentro del texto
            requiresImmediateAttention: keyWordAttentions.some((keyword) => lowerInput.includes(keyword)),
            diagnostic: input.trim(),
            processIn: new Date().toISOString()
        };
    }
}
export const diagnosticRunnable = new DiagnosticRunnable();
//# sourceMappingURL=diagnosticRunnable.js.map