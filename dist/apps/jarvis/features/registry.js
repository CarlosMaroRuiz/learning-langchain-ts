import { browserSkill } from "./browser/feature.js";
import { musicSkill } from "./music/feature.js";
const registeredSkills = [musicSkill, browserSkill];
export const getAllSkills = () => registeredSkills;
export const getSkill = (id) => registeredSkills.find((skill) => skill.id === id);
export const getAllTools = () => registeredSkills.flatMap((skill) => [...skill.tools]);
export const prepareSkillsForTurn = async (userText) => {
    for (const skill of registeredSkills) {
        if (skill.beforeTurn) {
            await skill.beforeTurn(userText);
        }
    }
};
// Funciones de compatibilidad
export const getEnabledFeatures = (_userText) => registeredSkills;
export const getToolsForFeatures = (_features) => getAllTools();
export const prepareFeaturesForTurn = async (_features, userText) => prepareSkillsForTurn(userText);
//# sourceMappingURL=registry.js.map