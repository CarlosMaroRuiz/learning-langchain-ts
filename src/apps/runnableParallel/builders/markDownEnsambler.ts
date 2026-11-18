import { RunnableLambda } from "@langchain/core/runnables";
import type { SectionsDoc } from "../types/index.js";

const SECTION_ORDER: (keyof SectionsDoc)[] = [
  "frontPage",
  "whatIs",
  "howItWorks",
  "practicalCase",
  "applications",
  "bestPractices",
  "comparison",
];


export const assemblerMarkdownNode = RunnableLambda.from<SectionsDoc, string>(
  (sections) => {
    return SECTION_ORDER
      .map((key) => sections[key].trim())
      .join("\n\n---\n\n");
  }
).withConfig({
  runName: "AssemblerMarkdownNode",
  tags: ["deterministic", "formatting"],
});