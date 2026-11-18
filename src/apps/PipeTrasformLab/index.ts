import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableLambda } from "@langchain/core/runnables";
import { modelLocal } from "../../core/models/index.js";

// Helper espía: imprime la clase exacta y el valor que sale de cada paso sin alterarlo
const mostrarTransformacion = <T>(paso: string) =>
  RunnableLambda.from((dato: T): T => {
    console.log(`\n[DESPUÉS DE: ${paso}]`);
    console.log(`   Tipo / Clase : ${dato?.constructor?.name ?? typeof dato}`);
    console.log("   Valor actual :", dato);
    return dato; // Pasa el dato intacto al siguiente .pipe()
  });

const PipeTransformLab = async () => {
  console.log("=== RADIOGRAFÍA DE TRANSFORMACIÓN EN .pipe() ===");

  // PIEZA 1: Función TS (convierte un string crudo en el objeto que pide el prompt)
  const prepararVariable = RunnableLambda.from((codigoCrudo: string) => ({
    codigo: codigoCrudo.trim(),
  }));

  // PIEZA 2: Plantilla de Prompt (rellena {codigo} y crea los mensajes con roles)
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Explica en máximo 12 palabras qué hace este código."],
    ["user", "{codigo}"],
  ]);

  // PIEZA 3: Tu modelo Ollama (modelLite)
  // PIEZA 4: Parser (extrae el texto limpio del AIMessage)
  const parser = new StringOutputParser();

  // PIEZA 5: Función TS final (empaqueta el texto en un objeto de respuesta)
  const empaquetarResultado = RunnableLambda.from((textoLimpio: string) => ({
    exito: true,
    explicacion: textoLimpio,
    caracteres: textoLimpio.length,
  }));

  // ENSAMBLAMOS TODO CON .pipe() E INTERCALAMOS EL ESPÍA
  const cadena = prepararVariable
    .pipe(mostrarTransformacion("1. prepararVariable (RunnableLambda)"))
    .pipe(prompt)
    .pipe(mostrarTransformacion("2. ChatPromptTemplate"))
    .pipe(modelLocal)
    .pipe(mostrarTransformacion("3. modelLite (ChatOllama)"))
    .pipe(parser)
    .pipe(mostrarTransformacion("4. StringOutputParser"))
    .pipe(empaquetarResultado)
    .pipe(mostrarTransformacion("5. empaquetarResultado (RunnableLambda)"));

  // Disparamos la cadena con un string simple
  const entradaInicial = "   const total = precios.reduce((a, b) => a + b, 0);   ";
  console.log("\nENTRADA INICIAL (string):", JSON.stringify(entradaInicial));

  await cadena.invoke(entradaInicial);

  console.log("\n=== FIN DE LA RADIOGRAFÍA ===");
};

export default PipeTransformLab;
