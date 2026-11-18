import { Runnable, type RunnableConfig } from "@langchain/core/runnables";

export interface DiagnosticOut {
    requiresImmediateAttention: boolean;
    diagnostic: string;
    processIn: string;
}

class DiagnosticRunnable extends Runnable<string, DiagnosticOut> {
    lc_namespace = ["mi_proyecto", "runnables"];

    async invoke(input: string, _options?: Partial<RunnableConfig>): Promise<DiagnosticOut> {
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
            requiresImmediateAttention: keyWordAttentions.some((keyword) =>
                lowerInput.includes(keyword)
            ),
            diagnostic: input.trim(),
            processIn: new Date().toISOString()
        };
    }
}

export const diagnosticRunnable = new DiagnosticRunnable();
