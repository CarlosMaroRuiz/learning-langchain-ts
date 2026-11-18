import { RunnableLambda } from "@langchain/core/runnables";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { DocumentState } from "../types/index.js";

export const saveFileNode = RunnableLambda.from<DocumentState, string>(
  async (state) => {
    const outputDir = join(process.cwd(), "output");
    await mkdir(outputDir, { recursive: true });

    // Ej: "RunnablePassthrough in LangChain" -> "runnablepassthrough-in-langchain.md"
    const cleanName = state.topic
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    const fullPath = join(outputDir, `${cleanName}.md`);

    await writeFile(fullPath, state.markdown, "utf-8");

    return fullPath;
  }
).withConfig({
  runName: "SaveFileNode",
  tags: ["io", "filesystem"],
});