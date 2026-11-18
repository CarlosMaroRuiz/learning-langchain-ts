import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { createAgent } from "langchain";
import { modelLite } from "../../core/models/index.js";
import { getWeatherTool } from "./tools/index.js";

const AgentWeatherApp = async () => {
    const agent = createAgent({
        model: modelLite,
        tools: [getWeatherTool],
    });

    const response = await agent.invoke({
        messages: [{ role: "user", content: "¿Cuál es el clima actual en Tuxtla Gutiérrez?" }],
    });

    // Extraemos únicamente el último mensaje (la respuesta final de DeepSeek)
    const finalMessage = response.messages[response.messages.length - 1];
    console.log("\nRespuesta del agente:\n", finalMessage?.content);
};

export default AgentWeatherApp;
