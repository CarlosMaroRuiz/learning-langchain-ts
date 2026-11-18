# LangChain Fundamentals

## What is a Runnable?
A Runnable is the core building block of LangChain. It is the key component across the entire ecosystem; literally everything in LangChain is a Runnable.

### Generic signature: `Runnable<RunInput, RunOutput, CallOptions>`

When I look at the `@langchain` source code, specifically at Runnables, I see that the base definition of any block in LangChain has 3 generic parameters.

```typescript
abstract class Runnable<
  RunInput = any,
  RunOutput = any,
  CallOptions extends RunnableConfig = RunnableConfig
>
```
### **RunInput:** The exact type of data that the block expects when you call `.invoke(input)`.

- **For example:** In `ChatPromptTemplate<{ tema: string }>`, the `RunInput` is `{ tema: string }`.

- **for example** in `ChatOllama` the  `RunInput` is `BaseLanguageModelInput`  `(string | BaseMessage[] | ChatPromptValue)`

### **RunOutput:** The exact type of data that the block promises to return when it finishes.

### **CallOptions:** Runtime configuration options (they inherit from `RunnableConfig`, such as `callbacks`, `tags`, `metadata`, `signal` to cancel requests with `AbortController`, etc.).

## Core Runnable Methods

Every building block in LangChain implements `.invoke()`, `.stream()`, `.batch()`, `.pipe()`, and `.withConfig()`.

- **`.invoke()`:** Executes the Runnable with a single input and returns a single output.
- **`.stream()`:** Streams back chunks of the response as they are generated.
- **`.batch()`:** Processes a list of inputs in parallel and returns a list of outputs.
- **`.pipe()`:** Chains multiple Runnables together sequentially, passing the output of one as the input to the next.
- **`.withConfig()`:** Binds runtime configuration (like `tags`, `metadata`, or `callbacks`) to the Runnable.


