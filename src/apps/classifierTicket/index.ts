import {
  RunnableBranch,
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { classifierchain } from "./chains/classifier.chain.js";
import { vipEscalationChain } from "./chains/vipEscalationChain.js";
import { billingChain } from "./chains/billing.chain.js";
import { technicalChain } from "./chains/technical.chain.js";
import { generalChain } from "./chains/general.chain.js";
import type { ClasifierTicket } from "./types/index.js";

const ClassifierTicketApp = async () => {
  const supportPipeline = RunnableSequence.from([
    RunnablePassthrough.assign({
      classification: classifierchain,
    }),

    RunnableBranch.from<ClasifierTicket, string>([
      [
        (state) => state.userPlan === "pro" && state.classification.isUrgent,
        vipEscalationChain,
      ],
      [
        (state) => state.classification.department === "billing",
        billingChain,
      ],
      [
        (state) => state.classification.department === "technical",
        technicalChain,
      ],
      generalChain,
    ]).withConfig({ runName: "SupportTicketRouter" }),
  ]);

  const response = await supportPipeline.batch([
    {
      message: "URGENTE: Nuestra API en producción está tirando error 500.",
      userPlan: "pro",
    },
    {
      message: "Me cobraron dos veces la suscripción este mes, necesito un reembolso.",
      userPlan: "free",
    },
    {
      message: "¿Dónde puedo cambiar la foto de perfil de mi cuenta?",
      userPlan: "free",
    },
  ]);
  response.forEach((res, i) => console.log(`\n--- Caso ${i + 1} ---\n${res}`));
};

export default ClassifierTicketApp;