import { HumanMessage, AIMessage } from "@langchain/core/messages";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { HISTORY_MSG } from "./data/memory.js";
import { modelLite } from "../../core/models/index.js";

const ChatMemoryApp = async () => {
  const rl = readline.createInterface({ input, output });

  console.log("ChatMemoryApp initialized, escriba 'exit' para salir.");

  while (true) {
    const userInput = await rl.question("tu: ");
    if (userInput.toLowerCase() === "exit") {
      console.log("Saliendo de ChatMemoryApp...");
      break;
    }

    HISTORY_MSG.push(new HumanMessage(userInput));

    const stream = await modelLite.stream(HISTORY_MSG);

    process.stdout.write("\nAI: ");
    let fullResponse = "";

    // 2. Iteramos sobre cada fragmento (chunk) conforme llega de la API
    for await (const chunk of stream) {
      const content = chunk.content.toString();
      process.stdout.write(content); // Imprime sin salto de línea
      fullResponse += content;       // Acumula el texto completo
    }

    console.log("\n");

    // 3. Guardamos la respuesta completa acumulada en la memoria
    HISTORY_MSG.push(new AIMessage(fullResponse));
  }

  rl.close();
};

export default ChatMemoryApp;
