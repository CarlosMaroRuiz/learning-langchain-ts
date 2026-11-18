import { RunnableLambda } from "@langchain/core/runnables";

export const logRunnable = RunnableLambda.from(
    (logRaw:string) => ({
        logMsgClean:logRaw.trimEnd(),
        originalLength:logRaw.length
    })
)