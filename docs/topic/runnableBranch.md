### `RunnableBranch<RunInput, RunOutput>`

Es la primitiva de **enrutamiento condicional declarativo** en LCEL (`@langchain/core/runnables`). Permite evaluar una lista ordenada de condiciones sobre `RunInput` y ejecutar exclusivamente el `Runnable` cuya condición se cumpla primero (equivalente a un `if / else if / else` dentro de una tubería).

- **Firma y estructura (`RunnableBranch.from(...)`):**
  Recibe un arreglo compuesto por:
  1. **Pares `[condición, runnable]`:** Donde `condición` es una función `(input: RunInput) => boolean | Promise<boolean>` (se evalúan de arriba hacia abajo y **se detiene en la primera que devuelva `true`**).
  2. **Un `defaultRunnable` obligatorio al final:** Se ejecuta si ninguna de las condiciones anteriores devolvió `true` (garantiza que la rama siempre produzca un `RunOutput` válido y nunca quede `undefined`).
- **Contrato de tipos (`<RunInput, RunOutput>`):**
  - Todas las ramas (`branch1`, `branch2`, `defaultBranch`) deben aceptar el mismo `RunInput` y devolver un tipo compatible con `RunOutput`.
- **Casos de uso principales:**
  - **Enrutamiento por perfil o nivel:** Cambiar prompts, profundidad técnica o plantillas según `state.level` (`"Beginner"` vs `"Senior"`).
  - **Clasificación de intención (Semantic Routing):** Un nodo previo clasifica la consulta (`"billing" | "tech_support" | "sales"`) y `RunnableBranch` despacha al sub-grafo o cadena especializada.
  - **Validación / Cortocircuito (Short-circuit):** Si el resultado ya existe en caché o cumple cierta regla, saltarse la llamada al LLM y devolver el valor directo.
- **Nota de arquitectura (LCEL vs LangGraph):**
  - `RunnableBranch` es ideal para **bifurcaciones hacia adelante (DAGs)** donde cada camino converge hacia el final. Si necesitas que una rama **regrese** hacia un paso anterior en bucle, el siguiente nivel es un *Conditional Edge* en **LangGraph**.

---

#### Ejemplo 1: Sintaxis Base (Condiciones síncronas y asíncronas)

```typescript
import { RunnableBranch, RunnableLambda } from "@langchain/core/runnables";

interface TicketInput {
  id: string;
  priority: "low" | "high" | "critical";
  isCached?: boolean;
}

const cachedBranch = RunnableLambda.from<TicketInput, string>(
  (ticket) => `[CACHE] Ticket ${ticket.id} resuelto instantáneamente.`
).withConfig({ runName: "CachedBranch" });

const urgentBranch = RunnableLambda.from<TicketInput, string>(
  (ticket) => `[URGENT] Escalando ticket ${ticket.id} a guardia de ingeniería.`
).withConfig({ runName: "UrgentBranch" });

const standardBranch = RunnableLambda.from<TicketInput, string>(
  (ticket) => `[STANDARD] Ticket ${ticket.id} encolado en soporte normal.`
).withConfig({ runName: "StandardBranch" });

const ticketRouter = RunnableBranch.from<TicketInput, string>([
  // 1. Primera condición (puede ser síncrona o async)
  [(input) => Boolean(input.isCached), cachedBranch],

  // 2. Segunda condición (solo se evalúa si la primera fue false)
  [(input) => input.priority === "critical" || input.priority === "high", urgentBranch],

  // 3. Rama Default obligatoria (se ejecuta si ninguna condición se cumplió)
  standardBranch,
]).withConfig({ runName: "TicketRouter" });

// Uso:
await ticketRouter.invoke({ id: "TK-99", priority: "critical" });
// -> "[URGENT] Escalando ticket TK-99 a guardia de ingeniería."