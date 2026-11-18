# Guía Rápida: Entendiendo la Temperatura en los Modelos de IA

La **temperatura** (`temperature`) es un parámetro que controla el nivel de aleatoriedad y creatividad en las respuestas de un modelo de lenguaje (LLM). 

Técnicamente, ajusta la distribución de probabilidad de las siguientes palabras (tokens) que el modelo puede elegir al generar texto.

---

## Escala de Valores

El valor suele ir de **`0.0` a `1.0`** (aunque algunos modelos permiten llegar hasta `2.0`).

| Valor | Comportamiento | Descripción |
| :--- | :--- | :--- |
| **`0.0`** | **Determinista** | El modelo siempre elige la opción con mayor probabilidad. Respuestas predecibles y consistentes. |
| **`0.1 - 0.3`** | **Muy preciso** | Mínima variación. Mantiene el enfoque lógico permitiendo ligeros ajustes de redacción. |
| **`0.4 - 0.7`** | **Equilibrado** | Balance entre coherencia y naturalidad. Ideal para conversaciones generales. |
| **`0.8 - 1.0+`** | **Creativo / Aleatorio** | El modelo asume riesgos y elige palabras menos comunes. Mayor variedad, pero mayor riesgo de incoherencias o alucinaciones. |

---

## ¿Qué temperatura elegir según la tarea?

### 1. Tareas Técnicas y Automatización (`0.0` a `0.2`)
Recomendado cuando necesitas exactitud y que el modelo siga instrucciones estrictas sin improvisar:
* Extracción de datos y análisis de texto.
* Generación de código y consultas SQL.
* Respuestas en formatos estructurados (JSON, XML, Markdown estricto).
* Uso de herramientas (*Tool Calling* / Agentes).
* Clasificación de información y traducciones literales.

### 2. Uso General y Asistentes (`0.5` a `0.7`)
Recomendado cuando buscas respuestas naturales que no suenen robóticas:
* Chatbots de atención al cliente.
* Redacción de correos electrónicos o resúmenes.
* Explicación de conceptos educativos.

### 3. Creación de Contenido (`0.8` a `1.0`)
Recomendado cuando la originalidad es más importante que la precisión estricta:
* Lluvia de ideas (*Brainstorming*).
* Escritura creativa, cuentos o guiones.
* Generación de nombres, eslóganes o *copywriting*.

---

## Ejemplo de configuración en TypeScript (LangChain + Ollama)

```typescript
import { ChatOllama } from "@langchain/ollama";

// Configuración para ejecución de tareas y código (Determinista)
export const modelTareas = new ChatOllama({
  model: "qwen3:8b",
  temperature: 0,
  baseUrl: "http://localhost:11434",
});

// Configuración para lluvia de ideas o redacción (Creativo)
export const modelCreativo = new ChatOllama({
  model: "qwen3:8b",
  temperature: 0.8,
  baseUrl: "http://localhost:11434",
});
```

---

## Notas Adicionales
* **Determinismo en GPU:** Aunque uses `temperature: 0`, los modelos ejecutados localmente pueden presentar variaciones mínimas ocasionales debido al procesamiento en paralelo de las tarjetas gráficas.
* **Relación con `top_p`:** Otro parámetro común es `top_p` (*nucleus sampling*). Como buena práctica, se recomienda modificar **solo uno** de los dos (la temperatura o el `top_p`) y dejar el otro en su valor por defecto.
