import { tool } from "@langchain/core/tools";
import { toolSchema } from "../types/index.js";
import { getWeather } from "../controller/index.js";
export const getWeatherTool = tool(getWeather, {
    name: "getWeather",
    description: "Obtiene el clima actual de una ciudad específica.",
    schema: toolSchema
});
//# sourceMappingURL=index.js.map