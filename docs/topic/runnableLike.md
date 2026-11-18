### `RunnableLike<RunInput, RunOutput>`

Es el **tipo unión fundamental** en `@langchain/core/runnables` que define qué elementos son válidos para encadenarse dentro de `.pipe()`, `RunnableSequence.from([...])` o como ramas de un `RunnableParallel`. Gracias a este tipo, LCEL permite mezclar componentes nativos de LangChain con código estándar de TypeScript sin envoltorios manuales.

#### Definición formal de tipo

```typescript
type RunnableLike<RunInput RunOutput="any" any,> =
  | RunnableInterface<RunInput, RunOutput>
  | RunnableFunc<RunInput, RunOutput>
  | RunnableMapLike<RunInput, RunOutput>;