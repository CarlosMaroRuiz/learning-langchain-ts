import { RunnableLambda } from "@langchain/core/runnables";
import { assemblerMarkdownNode } from "./markDownEnsambler.js";
import { sanitizeMdNode } from "../node/sanitizeNode.js";
import type { DocInput, SectionsDoc } from "../types/index.js";

export const buildMarkdownSubchain = RunnableLambda.from(
    (state: DocInput & { sections: SectionsDoc }) => state.sections
)
    .pipe(assemblerMarkdownNode)
    .pipe(sanitizeMdNode);
