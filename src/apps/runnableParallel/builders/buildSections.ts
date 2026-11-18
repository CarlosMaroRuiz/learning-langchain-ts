import { RunnableParallel } from "@langchain/core/runnables";
import type { DocInput, SectionsDoc } from "../types/index.js";
import { chatNode } from "../node/chatNode.js";

export const buildSection = RunnableParallel.from<DocInput, SectionsDoc>({
  frontPage: chatNode(
    "Generate only an engaging Markdown title (# Title), a 1-line subtitle, and a brief metadata table (Topic, Level: {level}, Focus: {focus}) about '{topic}'."
  ),

  whatIs: chatNode(
    "Write the section '## 1. Fundamentals and Concept' explaining what '{topic}' is, its origin or core purpose, and why it matters, tailored to a {level} level with a {focus} focus. Maximum 2 clear paragraphs."
  ),

  howItWorks: chatNode(
    "Write the section '## 2. Mechanics and How It Works' explaining step by step how '{topic}' works or is structured internally (level: {level}, focus: {focus}). Include a clean ASCII visual diagram inside a ```text block."
  ),

  practicalCase: chatNode(
    "Write the section '## 3. Applied Practical Case' showing a concrete, realistic, step-by-step example of '{topic}' (if the focus '{focus}' is programming-related, include clean typed code; otherwise, develop a detailed real-world scenario)."
  ),

  applications: chatNode(
    "Write the section '## 4. Real-World Applications and Scenarios' detailing 3 concrete situations where '{topic}' creates high impact, tailored to {level} level and {focus} focus."
  ),

  bestPractices: chatNode(
    "Write the section '## 5. Keys to Success and Common Pitfalls' with 3 essential recommendations and 2 frequent mistakes to avoid when dealing with '{topic}' (level: {level})."
  ),

  comparison: chatNode(
    "Write the section '## 6. Comparison and Alternatives' with a Markdown table comparing '{topic}' against its 2 closest alternatives or approaches (Criteria, Main Advantage, Limitation) for {level} level."
  ),
});