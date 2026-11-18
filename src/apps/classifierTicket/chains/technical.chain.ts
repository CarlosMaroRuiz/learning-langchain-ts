import { technicalPrompt } from "../prompts/technical.prompt.js";
import { llmString } from "../llm/index.js";

export const technicalChain = technicalPrompt
  .pipe(llmString)
  .withConfig({
    runName: "TechnicalChain",
    tags: ["support", "technical"],
  });