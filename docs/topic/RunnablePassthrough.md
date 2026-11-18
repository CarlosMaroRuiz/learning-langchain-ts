### `RunnablePassthrough<RunInput>` y `.assign()`

Es la primitiva de **preservación y enriquecimiento de estado** en LCEL (`@langchain/core/runnables`). Su función es dejar pasar el dato de entrada sin modificarlo (`input => input`), permitiendo que los metadatos originales sobrevivan a lo largo de una tubería mientras los nodos siguientes calculan y acumulan valores nuevos.

- **Modelo mental (Analogía con React / Spread Operator):**
  - Funciona exactamente igual que propagar `props` en React o hacer una fusión con el operador *spread* en JavaScript:
    ```typescript
    // Fórmula interna de .assign():
    Salida = { ...RunInput, ...RunOutput };
    ```
  - Cada paso recibe el objeto acumulado hasta ese momento (`RunInput`), calcula únicamente las llaves nuevas (`RunOutput`) y las **concatena aplanadas en la raíz** del objeto (sin anidarlas dentro de una llave `input`).
- **Modos de uso:**
  1. **`new RunnablePassthrough()` (Paso directo):** Devuelve exactamente la misma entrada que recibió. Se usa dentro de `RunnableParallel` cuando la entrada es un primitivo (como un `string`) o cuando se desea aislar la entrada bajo una llave explícita (`{ input: new RunnablePassthrough() }`).
  2. **`RunnablePassthrough.assign({ ... })` (Acumulador de estado):** Recibe un objeto de entrada (`Record<string, any>`), ejecuta las ramas definidas en el mapa usando ese objeto como entrada y devuelve la intersección combinada (`RunInput & RunOutput`).
- **Contrato de tipos (`.assign`):**
  - **`RunInput`:** Debe ser un objeto (`Record<string, any>`).
  - **`RunOutput`:** Es la intersección de tipos `RunInput & { [K in keyof Mapa]: OutputDeRamaK }`.
  - **Nota sobre inferencia en TypeScript:** Dentro de un arreglo `RunnableSequence.from([...])`, TypeScript puede perder la inferencia progresiva entre pasos, por lo que conviene tipar explícitamente el parámetro `(state: DocInput & { sections: SectionsDoc }) => ...` o encadenar con `.pipe()` para mantener inferencia automática.
- **Diferencia clave con `RunnableParallel` y funciones sueltas:**
  - `RunnableParallel` o una función flecha suelta **reemplazan** el objeto de entrada por un valor nuevo (destruyendo los metadatos previos como `topic` o `level`).
  - `RunnablePassthrough.assign()` **conserva** todas las llaves de `RunInput` y les suma `RunOutput`, permitiendo que un nodo final (como `saveFileNode`) reciba el estado completo y desestructure solo lo que necesita (`{ topic, markdown }`).

#### Diagrama de acumulación de estado (`.assign()`)

```text
INICIO (DocInput):
{ topic: "Docker", level: "Junior", focus: "DevOps" }
       │
       ├─► RunnablePassthrough.assign({ sections: buildSection })
       │     ├─ Recibe:  DocInput
       │     ├─ Calcula: { sections: SectionsDoc }
       │     └─ Entrega: { topic, level, focus, sections }
       │
       ├─► RunnablePassthrough.assign({ markdown: (state) => assemblerMarkdown(state.sections) })
       │     ├─ Recibe:  DocInput & { sections }
       │     ├─ Calcula: { markdown: string }
       │     └─ Entrega: { topic, level, focus, sections, markdown }  <-- DocumentState
       │
       └─► saveFileNode({ topic, markdown })
             └─ Usa `topic` para nombrar el archivo y `markdown` para escribir el contenido.