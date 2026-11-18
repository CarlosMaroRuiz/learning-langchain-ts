import type { StructuredToolInterface } from "@langchain/core/tools";
import { browserSkill } from "./browser/feature.js";
import { musicSkill } from "./music/feature.js";
import type { JarvisSkill } from "./types.js";

const registeredSkills: readonly JarvisSkill[] = [musicSkill, browserSkill];

export const getAllSkills = (): readonly JarvisSkill[] => registeredSkills;

export const getSkill = (id: string): JarvisSkill | undefined =>
  registeredSkills.find((skill) => skill.id === id);

export const getAllTools = (): StructuredToolInterface[] =>
  registeredSkills.flatMap((skill) => [...skill.tools]);

export const prepareSkillsForTurn = async (userText: string): Promise<void> => {
  for (const skill of registeredSkills) {
    if (skill.beforeTurn) {
      await skill.beforeTurn(userText);
    }
  }
};

// Funciones de compatibilidad
export const getEnabledFeatures = (_userText?: string): readonly JarvisSkill[] => registeredSkills;
export const getToolsForFeatures = (_features?: readonly JarvisSkill[]): StructuredToolInterface[] => getAllTools();
export const prepareFeaturesForTurn = async (
  _features: readonly JarvisSkill[],
  userText: string
): Promise<void> => prepareSkillsForTurn(userText);
