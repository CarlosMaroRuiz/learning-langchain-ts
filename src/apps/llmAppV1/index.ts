import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Runnable } from "@langchain/core/runnables";
import { modelLocal } from "../../core/models/index.js";

const RunnableContratoLab = async () => {
  console.log("=== INICIANDO LABORATORIO: Runnable<RunInput, RunOutput> ===\n");

  // 1. Nodos individuales (Pasa el mouse sobre cada uno para ver su firma)
  const prompt = ChatPromptTemplate.fromTemplate(
    "Dame un sinónimo técnico en español de: {palabra}"
  );
  const parser = new StringOutputParser();

  // 2. Firma explícita: Entrada { palabra: string } -> Salida string
  const cadenaBase: Runnable<{ palabra: string }, string> = prompt
    .pipe(modelLocal)
    .pipe(parser);

  // 3. .withConfig() devuelve una copia con opciones pegadas sin alterar los tipos
  const cadenaConfigurada = cadenaBase.withConfig({
    maxConcurrency: 2, // Protege tus 4GB de VRAM en .batch()
    runName: "GeneradorSinonimosLab",
    metadata: { version: "1.0", autor: "car06" },
  });

  // Prueba A: .invoke() (1 entrada -> 1 salida)
  console.log("--- 1. Probando .invoke() ---");
  const uno = await cadenaConfigurada.invoke({ palabra: "latencia" });
  console.log("Resultado invoke:", uno, "\n");

  // Prueba B: .stream() (1 entrada -> flujo continuo de chunks string)
  console.log("--- 2. Probando .stream() ---");
  process.stdout.write("Resultado stream: ");
  const stream = await cadenaConfigurada.stream({ palabra: "polimorfismo" });
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
  console.log("\n");

  // Prueba C: .batch() (Arreglo de entradas -> Arreglo de salidas en paralelo)
  console.log("--- 3. Probando .batch() ---");
  const lote = await cadenaConfigurada.batch(
    [{ palabra: "concurrencia" }, { palabra: "serialización" }],
    undefined,
    { returnExceptions: true }
  );
  console.log("Resultado batch:", lote);

  console.log("\n=== FIN DEL LABORATORIO ===");
};

export default RunnableContratoLab;
