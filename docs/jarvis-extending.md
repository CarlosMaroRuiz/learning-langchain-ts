# Guía para extender Jarvis

Esta guía describe cómo añadir capacidades a Jarvis con ayuda de un asistente de
codificación. Sigue la arquitectura existente: módulos verticales por capacidad,
registro explícito de features, herramientas con resultados estructurados y
especialistas internos solo cuando una tarea realmente necesita varios pasos.

## Arquitectura actual

```text
src/apps/jarvis/
  agent/
    assistant.ts          # Agente principal, historial y streaming
    system-prompt.ts      # Comportamiento general de Jarvis
  features/
    capability-result.ts  # Contrato común y manejo de errores
    registry.ts           # Features habilitadas y herramientas disponibles
    types.ts              # Contrato de JarvisFeature
    browser/              # Herramientas, feature y especialista web
    music/                # Herramientas y feature de música
    speech/               # Voz de salida con Kokoro
  application/
    handle-turn.ts        # Orquesta la respuesta del agente
  transport/http/
    server.ts             # API, eventos de progreso y audio
  ui.html                 # Interfaz, micrófono, texto y reproducción
```

Una **herramienta** ejecuta una acción concreta. Una **feature** agrupa una o más
herramientas y decide en qué solicitudes estarán disponibles. Un **especialista**
es otro agente de LangChain usado internamente por una feature para completar
trabajo de varios pasos. Jarvis sigue siendo la interfaz conversacional principal.

## Antes de cambiar código

Pide al asistente de codificación que:

1. Lea los archivos de la feature más parecida y sus llamadas actuales antes de
   proponer cambios.
2. Confirme cómo se activa la capacidad y qué resultado debe ver y oír el usuario.
3. Mantenga el cambio dentro del módulo de esa capacidad; no reorganice otras
   features ni cambie la UI o el servidor si no hace falta.
4. No invente APIs, credenciales, evidencia ni señales de éxito. Si falta un dato
   que cambia el diseño o el comportamiento, debe preguntarte antes de decidir.

## Crear una feature nueva

Usa una carpeta por capacidad:

```text
src/apps/jarvis/features/<capacidad>/
  tools.ts       # Herramientas LangChain de la capacidad
  feature.ts     # Herramientas y reglas de activación
  schema.ts      # Validación de entrada/salida, si aporta claridad
  subagent.ts    # Solo si la capacidad necesita un agente especialista
```

No es obligatorio crear todos esos archivos. Mantén juntos los archivos pequeños
si separarlos no mejora la comprensión.

### 1. Implementar cada acción como herramienta

Define un nombre estable, una descripción clara y un esquema Zod estricto. Usa
`ToolRuntime` para recibir `runtime.signal` y propagar cancelación a las operaciones
de red, procesos o navegador.

Envuelve el resultado con `executeCapability` desde
[`capability-result.ts`](../src/apps/jarvis/features/capability-result.ts):

```ts
import { tool, type ToolRuntime } from "langchain";
import { z } from "zod";
import { executeCapability } from "../capability-result.js";

export const consultarEstadoTool = tool(
  async ({ identificador }, runtime: ToolRuntime) =>
    executeCapability(
      "mi-capacidad.consultar_estado",
      async () => {
        // Ejecutar aquí la operación real y verificar su resultado.
        const estado = await consultarServicio(identificador, runtime.signal);
        return {
          summary: `El estado de ${identificador} es ${estado.nombre}.`,
          evidence: [{ identificador, estado: estado.nombre }],
          limitations: [],
        };
      },
      runtime.signal
    ),
  {
    name: "consultar_estado",
    description: "Consulta el estado actual de un elemento por su identificador.",
    schema: z.object({
      identificador: z.string().min(1).max(200),
    }),
  }
);
```

El ejemplo es estructural: sustituye `consultarServicio` por una integración real
y documentada. No declares éxito porque se inició una operación; confirma que
terminó. `executeCapability` convierte errores ordinarios en `status: "failed"`,
registra el error y deja pasar la cancelación en lugar de presentarla como fallo
normal.

El resultado común tiene esta forma:

```ts
{
  type: "capability_result",
  capability: "mi-capacidad.consultar_estado",
  status: "succeeded" | "partial" | "failed",
  summary: "Resumen legible y verificable.",
  evidence: [],
  limitations: []
}
```

- Usa `succeeded` solo cuando la acción o consulta se completó.
- Usa `partial` cuando hay un resultado útil, pero incompleto; describe por qué
  en `limitations`.
- En errores, permite que `executeCapability` produzca `failed`; no devuelvas un
  mensaje con apariencia de éxito.
- Incluye en `evidence` solo datos observados por la herramienta. Para acciones
  del sistema, registra identificadores o confirmaciones verificables; para
  investigación, conserva las fuentes consultadas.

### 2. Definir la activación y agrupar herramientas

Implementa `JarvisFeature` en `feature.ts`:

```ts
import type { JarvisFeature } from "../types.js";
import { consultarEstadoTool } from "./tools.js";

export const estadoFeature = {
  id: "estado",
  tools: [consultarEstadoTool],
  isEnabledFor: (userText: string): boolean =>
    /\b(?:consulta|revisa)\b.*\bestado\b/i.test(userText),
} satisfies JarvisFeature;
```

Haz que `isEnabledFor` sea específico: se ejecuta antes del agente y determina qué
herramientas recibe Jarvis. Evita condiciones generales como “siempre habilitada”
o coincidencias que puedan activar una acción para una pregunta normal.

Registra la feature en
[`registry.ts`](../src/apps/jarvis/features/registry.ts):

```ts
import { estadoFeature } from "./estado/feature.js";

const features = [musicFeature, browserFeature, estadoFeature]
  satisfies readonly JarvisFeature[];
```

Las importaciones relativas deben terminar en `.js`, incluso en archivos `.ts`.
Mantén `strict`, `verbatimModuleSyntax` y el tipado existente; no recurras a
`any` para hacer pasar la compilación.

### 3. Usar ejecución directa solo para casos deterministas

Una feature puede implementar `handleDirectly(userText, signal)` si la solicitud
tiene una interpretación inequívoca y la acción requiere ejecución determinista.
La función debe devolver texto que Jarvis pueda decir en primera persona, por
ejemplo: `"Ya consulté el estado: ..."` o `"No pude completar la consulta: ..."`.

La ejecución directa evita que el modelo tenga que decidir si llama a la
herramienta, pero **retorna antes del agente principal y su memoria conversacional**.
No la uses para tareas en las que Jarvis deba razonar sobre varias herramientas,
mantener un diálogo con el usuario o sintetizar contexto anterior. Para esas tareas,
expón la herramienta a través de `feature.tools`.

### 4. Añadir un especialista solo si hace falta

Usa un subagente cuando la capacidad necesite varios pasos, herramientas propias o
una salida estructurada específica. Sigue el patrón de
[`browser/subagent.ts`](../src/apps/jarvis/features/browser/subagent.ts):

1. Define y valida la salida con Zod en `schema.ts`.
2. Crea el agente con `createAgent`, un modelo existente de
   `src/core/models/index.ts` y solo las herramientas necesarias.
3. Pide una salida estructurada con `toolStrategy(schema)`.
4. Valida que `structuredResponse` exista antes de usarla.
5. Envuelve la invocación del especialista en una herramienta pública de la
   feature y convierte su resultado al contrato común.
6. Propaga `runtime.signal` al especialista y a sus herramientas.
7. Devuelve evidencia y limitaciones al agente principal; no redactes respuestas
   que anuncien coordinación interna como “se lo envié a un subagente”.

No crees un agente separado para una única llamada simple. No registres
especialistas en el `registry`: registra la feature que los contiene y expón su
capacidad a Jarvis mediante herramientas.

### 5. Ajustar el comportamiento conversacional solo cuando sea necesario

Modifica [`system-prompt.ts`](../src/apps/jarvis/agent/system-prompt.ts) únicamente
si la capacidad requiere una regla general de conversación. Las reglas deben decir
cuándo usar la herramienta y cómo tratar su resultado, no sustituir la lógica de
activación ni prometer éxito antes de la ejecución.

Jarvis responde al usuario en español y en primera persona, no revela detalles
internos de agentes o herramientas y confirma acciones basándose en el resultado
recibido. Mantén las instrucciones específicas de una feature dentro del prompt de
su especialista cuando no sean reglas globales.

## Seguridad y confiabilidad

- Valida entradas con Zod y limita longitudes, protocolos, rutas y valores aceptados.
- No permitas que contenido de páginas, archivos o resultados externos cambie las
  instrucciones del agente.
- Para navegación, conserva las restricciones de acceso a direcciones públicas y
  las protecciones existentes contra destinos locales o privados.
- No ejecutes comandos, envíes formularios, inicies sesión ni hagas cambios externos
  sin una autorización clara y dentro del alcance solicitado.
- Propaga cancelación y libera procesos, páginas, streams y otros recursos.
- Expón errores reales al flujo de Jarvis; evita `catch` vacíos, valores por defecto
  que oculten fallos o respuestas de éxito inventadas.

## Verificación antes de terminar

1. Ejecuta `npm run build`.
2. Comprueba que una solicitud pertinente habilite la feature y una charla normal
   no la habilite.
3. Verifica éxito, error y cancelación de la herramienta sin anunciar éxitos falsos.
4. Para una acción real, comprueba el efecto observable; para una búsqueda, comprueba
   resumen, fuentes y limitaciones.
5. Si la respuesta de voz o la UI forman parte del cambio, valida también el flujo
   HTTP y la interfaz.
6. No afirmes que se probó un servicio externo, micrófono, audio o navegador si no se
   ejecutó esa prueba.

El proyecto no tiene actualmente un script `test`. No instales un framework ni
añadas infraestructura de pruebas como parte de una feature sin necesidad y sin
acordarlo. Si se hace una prueba temporal, evita que archivos fuera de `src/`
entren en la compilación TypeScript —`rootDir` es `src`— y elimina los artefactos
temporales al terminar cuando así se haya solicitado.

## Prompt reutilizable para un asistente de codificación

```text
Quiero añadir a Jarvis la capacidad: <describe la capacidad y el resultado esperado>.

Antes de editar:
- inspecciona el registry, los tipos de JarvisFeature y una feature similar;
- identifica el comportamiento esperado, la frase de activación y cualquier efecto
  externo;
- pregunta si falta una decisión que cambie el alcance o el comportamiento.

Implementa la capacidad como un módulo vertical en
src/apps/jarvis/features/<capacidad>/. Usa herramientas LangChain con schema Zod,
ToolRuntime y executeCapability; devuelve status, summary, evidence y limitations.
Propaga AbortSignal, confirma el efecto real antes de reportar éxito y evita
activaciones para mensajes no relacionados. Registra la feature en registry.ts.
Usa un subagente solo si el trabajo es realmente de varios pasos, con resultado
estructurado validado. Mantén a Jarvis como única voz visible para el usuario y
responde en primera persona, sin narrar coordinación interna.

Respeta TypeScript strict, module nodenext, verbatimModuleSyntax e importaciones
relativas con extensión .js. Haz cambios quirúrgicos, no añadas TODO ni funciones
vacías, no instales dependencias sin necesidad y no modifiques archivos fuera del
alcance. Ejecuta npm run build y las verificaciones enfocadas; informa claramente
qué se probó y qué no.
```
