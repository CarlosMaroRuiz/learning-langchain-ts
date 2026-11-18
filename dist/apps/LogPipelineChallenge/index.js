import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { logRunnable } from "./runnables/logRunable.js";
import { modelLocal } from "../../core/models/index.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { diagnosticRunnable } from "./runnables/diagnosticRunnable.js";
const LogPipeLineChallege = async () => {
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "Traduce el error al español y explica en 1 sola oración corta cuál es la causa probable."],
        ["human", "Mensaje: {logMsgClean} | Longitud original: {originalLength}"]
    ]);
    const parser = new StringOutputParser();
    const chainLog = logRunnable
        .pipe(prompt)
        .pipe(modelLocal)
        .pipe(parser)
        .pipe(diagnosticRunnable)
        .withConfig({
        runName: "AuditorLogsPipeline", // para auditoria
        maxConcurrency: 2 // para el batch
    });
    const logs = [
        "CRITICAL: Database connection refused on port 5432   ",
        "WARN: High memory usage detected in worker node 02     ",
        "ERROR: UnhandledPromiseRejection - Token expired   ",
        "INFO: Scheduled backup completed successfully  ",
        "FATAL: Out of memory - JavaScript heap out of memory      ",
        "ERROR: ECONNRESET - Connection reset by peer   "
    ];
    const resultados = await chainLog.batch(logs);
    console.log(resultados);
};
export default LogPipeLineChallege;
//# sourceMappingURL=index.js.map