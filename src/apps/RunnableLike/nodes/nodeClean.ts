import type { RunnableLike } from "@langchain/core/runnables";

interface InputTicket{
    user:string,
    msgRaw:string
}

interface CleanTicket{
    user:string,
    msgClean:string
}
export const nodeClean: RunnableLike<InputTicket,CleanTicket> = (input) => ({
    user:input.user.trim(),
    msgClean:input.msgRaw.trim().replace(/\s+/g, " "),
})