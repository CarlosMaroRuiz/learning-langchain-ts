import { generalPrompt } from "../prompts/general.prompt.js";
import { llmString } from "../llm/index.js";

export const generalChain = generalPrompt
  .pipe(llmString)
  .withConfig({
    runName: "GeneralChain",
    tags: ["support", "general"],
  });