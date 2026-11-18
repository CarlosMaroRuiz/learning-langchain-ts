import { billingPrompt } from "../prompts/billing.prompt.js";
import { llmString } from "../llm/index.js";

export const billingChain = billingPrompt
  .pipe(llmString)
  .withConfig({
    runName: "BillingChain",
    tags: ["support", "billing"],
  });