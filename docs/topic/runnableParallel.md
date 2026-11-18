### `RunnableParallel<RunInput, RunOutput>` (alias `RunnableMap`)

Es la primitiva de composición concurrente en LCEL (`@langchain/core/runnables`) que implementa el patrón **Fork-Join (Bifurcación y Unión)**. Permite ejecutar múltiples ramas independientes de forma **simultánea (en paralelo)** sobre una **misma entrada única**, consolidando sus resultados en un único objeto tipado.

- **Funcionamiento (Fork-Join):**
  1. **Fork (Bifurcación):** Recibe un único `RunInput` y lo envía simultáneamente a todas las ramas definidas en su mapa.
  2. **Join (Unión):** Espera a que todas las ramas terminen (`Promise.all` interno) y devuelve un objeto con exactamente las mismas claves que se definieron en el mapa, donde cada clave contiene el resultado de su rama.
- **Contrato de tipos:**
  - `RunInput`: Debe ser compatible con la entrada que esperan **todas** las ramas del mapa.
  - `RunOutput`: Es un objeto mapeado `{ [K in keyof Mapa]: OutputDeRamaK }`.
- **Alias `RunnableMap`:** En `@langchain/core/runnables`, `RunnableMap` es un alias idéntico de `RunnableParallel` (`export { RunnableParallel as RunnableMap }`).
- **Coerción automática (`RunnableMapLike`):** Dentro de `.pipe({ ... })` o `RunnableSequence.from([...])`, pasar un objeto literal clave-valor equivale a instanciar `RunnableParallel.from({ ... })`.
- **Control de concurrencia:** Al ejecutarse, respeta `RunnableConfig` (como `{ maxConcurrency: 2 }`) para limitar cuántas ramas hacen llamadas simultáneas a la API del LLM y evitar errores de rate-limit.

#### Diagrama de flujo interno (Fork-Join)

```text
                     RunInput (I)
                          │
           ┌──────────────┼──────────────┐  ◄── Fork (misma entrada a todas)
           ▼              ▼              ▼
    ┌────────────┐ ┌────────────┐ ┌────────────┐
    │  Rama A    │ │  Rama B    │ │  Rama C    │  ◄── Ejecución concurrente
    │ (I -> OA)  │ │ (I -> OB)  │ │ (I -> OC)  │
    └──────┬─────┘ └──────┬─────┘ └──────┬─────┘
           │              │              │
           └──────────────┼──────────────┘  ◄── Join (espera a todas)
                          ▼
         RunOutput: { a: OA, b: OB, c: OC }