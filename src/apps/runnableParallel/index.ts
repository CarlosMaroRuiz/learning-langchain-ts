import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { buildSection } from "./builders/buildSections.js";
import { saveFileNode } from "./node/saveFileMd.js";
import { buildMarkdownSubchain } from "./builders/buildMd.js";

const generatorMdApp = async () => {

  const createDocument = RunnableSequence.from([
    RunnablePassthrough.assign({
      sections: buildSection,
    }),

    RunnablePassthrough.assign({
      markdown: buildMarkdownSubchain,
    }),

    saveFileNode,
  ]);

  const pathGenerated = await createDocument.invoke(
    {
      topic: "RunnableParallel in LangChain",
      level: "Intermediate",
      focus: "Backend architecture and concurrency in TypeScript",
    },
    { maxConcurrency: 4 }
  );

  console.log(`Documento generado físicamente en: ${pathGenerated}`);
};

export default generatorMdApp;