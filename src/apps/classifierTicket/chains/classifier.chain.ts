import { structureLlm } from "../llm/index.js";
import { promptBase } from "../prompts/classifier.prompt.js";

export const classifierchain  = promptBase.pipe(structureLlm).withConfig({ runName: "TicketClassifier" });