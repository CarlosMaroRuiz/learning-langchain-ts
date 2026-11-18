
import { RunnableSequence } from "@langchain/core/runnables";
import type { ClasifierTicket } from "../types/index.js";
import { vipPrompt } from "../prompts/vip.promp.js";
import { llmString } from "../llm/index.js";

export const vipEscalationChain = RunnableSequence.from<ClasifierTicket, string>([
  (state) => ({
    department: state.classification.department,
    userPlan: state.userPlan,
    message: state.message,
  }),
  vipPrompt,
  llmString
]).withConfig({
  runName: "VipEscalationChain",
  tags: ["support", "vip"],
});