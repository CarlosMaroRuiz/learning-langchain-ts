import { BaseMessage,SystemMessage} from "@langchain/core/messages";

export const HISTORY_MSG : BaseMessage[] = [
     new SystemMessage("Eres un tutor experto en LangChain.js. Ayuda al usuario a estudiar para su entrevista con respuestas claras y concisas."),
]