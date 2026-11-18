import { RunnableLambda } from "@langchain/core/runnables";
export const logRunnable = RunnableLambda.from((logRaw) => ({
    logMsgClean: logRaw.trimEnd(),
    originalLength: logRaw.length
}));
//# sourceMappingURL=logRunable.js.map