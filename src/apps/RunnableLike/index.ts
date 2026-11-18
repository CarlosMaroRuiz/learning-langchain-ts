import { RunnableSequence } from "@langchain/core/runnables"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { nodeClean } from "./nodes/nodeClean.js"
import { modelGoogle } from "../../core/models/index.js"
import { nodePrompt } from "./nodes/nodePrompt.js"
import { nodeAudit } from "./nodes/nodeAudit.js"

const RunnableLikeApp = async () => {
    const nodeParser = new StringOutputParser();

    const pipeLine = RunnableSequence.from([
        nodeClean, //===> runInput
        nodePrompt,
        modelGoogle,
        nodeParser,
        nodeAudit //-> runOut
    ])

    const outPipe = await pipeLine.invoke({
        user:"   Carlos   ",
        msgRaw: " doker no esta arrancando"
    })
    console.log(outPipe);
}
export default RunnableLikeApp;