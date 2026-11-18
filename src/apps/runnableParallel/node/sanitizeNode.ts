import { RunnableLambda } from "@langchain/core/runnables";

export const sanitizeMdNode = RunnableLambda.from<string, string>(
  (rawMd: string) => {
    const cleanedMarkdown: string = rawMd
      .replace(/^```markdown\s*/gim, "")
      .replace(/^```\s*$/gim, "")
      .replace(/^(\d+\.)\s*(#{2,3})\s+/gm, "$2 $1 ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (cleanedMarkdown.length < 200) {
      throw new Error(
        `[SanitizeNode] Generated markdown is too short (${cleanedMarkdown.length} chars).`
      );
    }

    return cleanedMarkdown;
  }
).withConfig({
  runName: "SanitizeMdNode",
  tags: ["deterministic", "post-processing"]
});