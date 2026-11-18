import type { RunnableLike } from "@langchain/core/runnables"

interface ResultAudit{
    totalWords:number,
    response:string,
    aproved:boolean
}

export const nodeAudit: RunnableLike<string,ResultAudit> = {
    totalWords:(text: string) => text.trim().split(/\s+/).length,
    response: (text:string) => text.trim(),
    aproved:(text:string) => text.trim().length > 10
};