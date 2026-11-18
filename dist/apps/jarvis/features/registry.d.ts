import type { StructuredToolInterface } from "@langchain/core/tools";
import type { JarvisSkill } from "./types.js";
export declare const getAllSkills: () => readonly JarvisSkill[];
export declare const getSkill: (id: string) => JarvisSkill | undefined;
export declare const getAllTools: () => StructuredToolInterface[];
export declare const prepareSkillsForTurn: (userText: string) => Promise<void>;
export declare const getEnabledFeatures: (_userText?: string) => readonly JarvisSkill[];
export declare const getToolsForFeatures: (_features?: readonly JarvisSkill[]) => StructuredToolInterface[];
export declare const prepareFeaturesForTurn: (_features: readonly JarvisSkill[], userText: string) => Promise<void>;
//# sourceMappingURL=registry.d.ts.map