import { Runnable, type RunnableConfig } from "@langchain/core/runnables";
export interface DiagnosticOut {
    requiresImmediateAttention: boolean;
    diagnostic: string;
    processIn: string;
}
declare class DiagnosticRunnable extends Runnable<string, DiagnosticOut> {
    lc_namespace: string[];
    invoke(input: string, _options?: Partial<RunnableConfig>): Promise<DiagnosticOut>;
}
export declare const diagnosticRunnable: DiagnosticRunnable;
export {};
//# sourceMappingURL=diagnosticRunnable.d.ts.map