### `RunnableSequence<RunInput, RunOutput>`

Es la clase primitiva de composición secuencial en LCEL (`@langchain/core/runnables`) que hereda de `Runnable` y permite encadenar dos o más nodos en una tubería lineal de ejecución ($R_1 \rightarrow R_2 \rightarrow \dots \rightarrow R_n$).

- **Funcionamiento:** Toma una entrada inicial, la procesa en el primer nodo y pasa la salida resultante como entrada del siguiente nodo de forma estrictamente secuencial hasta obtener el resultado final.
- **Contrato de tipos:**
  - `RunInput`: Corresponde al tipo de entrada del **primer** nodo de la cadena.
  - `RunOutput`: Corresponde al tipo de salida del **último** nodo de la cadena.
  - **Compatibilidad interna:** El `RunOutput` de cada paso debe coincidir con el `RunInput` del paso siguiente.
- **Relación con `.pipe()`:** Es la implementación real subyacente detrás del método `.pipe()`. Escribir `a.pipe(b).pipe(c)` equivale exactamente a `RunnableSequence.from([a, b, c])`.
- **Coerción automática (`RunnableLike`):** Acepta tanto instancias oficiales de `Runnable` como funciones puras de TypeScript (convertidas internamente a `RunnableLambda`) y objetos literales clave-valor (convertidos internamente a `RunnableParallel`).

#### Diagrama de flujo interno

```text
  RunInput (I)
       │
       ▼
┌──────────────┐
│   Nodo R1    │  ──► Ejecuta y transforma (I -> O1)
└──────┬───────┘
       │ Salida O1 (debe coincidir con la entrada de R2)
       ▼
┌──────────────┐
│   Nodo R2    │  ──► Ejecuta y transforma (O1 -> O2)
└──────┬───────┘
       │ Salida O2 (debe coincidir con la entrada de R3)
       ▼
┌──────────────┐
│   Nodo R3    │  ──► Ejecuta y transforma (O2 -> O)
└──────┬───────┘
       │
       ▼
  RunOutput (O)