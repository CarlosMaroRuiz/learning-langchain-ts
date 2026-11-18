import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";
import type { AppDefinition } from "../apps/types.js";

const EXIT_COMMANDS = new Set(["q", "quit", "exit", "salir"]);
const MENU_WIDTH = 52;

export interface CliOptions {
  help: boolean;
  list: boolean;
  app?: string;
}

interface PromptSession {
  ask(question: string): Promise<string | null>;
  close(): void;
}

/**
 * Cada prompt abre su propio readline y lo cierra antes de ejecutar la app,
 * para que la app pueda usar stdin sin pelear con el menú.
 */
function createPrompt(): PromptSession {
  const rl = createInterface({ input: stdin, output: stdout });
  let closed = false;

  return {
    ask: (question) =>
      new Promise<string | null>((resolve) => {
        if (closed) {
          resolve(null);
          return;
        }

        let settled = false;
        const finish = (value: string | null) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };

        rl.once("close", () => finish(null));
        rl.question(question, (answer) => finish(answer));
      }),
    close: () => {
      if (closed) return;
      closed = true;
      rl.close();
    },
  };
}

export function parseCliOptions(argv: readonly string[]): CliOptions {
  const options: CliOptions = { help: false, list: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === undefined) continue;

    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "-l" || arg === "--list") {
      options.list = true;
    } else if (arg === "-a" || arg === "--app") {
      const value = argv[index + 1];
      if (value !== undefined) {
        options.app = value;
        index += 1;
      }
    } else if (!arg.startsWith("-") && options.app === undefined) {
      options.app = arg;
    }
  }

  return options;
}

export function printHelp(apps: readonly AppDefinition[]): void {
  console.log(`Uso: npm run dev -- [opciones] [app]

Opciones:
  -l, --list        Lista las apps disponibles y termina.
  -a, --app <app>   Ejecuta una app sin abrir el menú (id o número).
  -h, --help        Muestra esta ayuda.

Ejemplos:
  npm run dev                       Menú interactivo.
  npm run apps                      Lista las apps.
  npm run dev -- 1                  Ejecuta la app 1 sin menú.
  npx tsx src/index.ts --app chat-memory

Apps registradas: ${apps.map((app) => app.id).join(", ")}`);
}

export function listApps(apps: readonly AppDefinition[]): void {
  apps.forEach((app, index) => {
    const description = app.description ? ` - ${app.description}` : "";
    console.log(`  ${index + 1}) ${app.name} [${app.id}]${description}`);
  });
}

function renderMenu(apps: readonly AppDefinition[]): void {
  const line = "=".repeat(MENU_WIDTH);

  console.log(`\n${line}`);
  console.log("  lg-ts | Selector de apps");
  console.log(line);
  apps.forEach((app, index) => {
    console.log(`  ${String(index + 1).padStart(2)}) ${app.name}  [${app.id}]`);
    if (app.description) {
      console.log(`      ${app.description}`);
    }
  });
  console.log("   q) Salir");
  console.log(line);
}

function isExitCommand(answer: string): boolean {
  return EXIT_COMMANDS.has(answer.trim().toLowerCase());
}

function resolveApp(
  apps: readonly AppDefinition[],
  query: string,
): AppDefinition | undefined {
  const value = query.trim().toLowerCase();
  if (value === "") return undefined;

  const position = Number(value);
  if (Number.isInteger(position) && position >= 1 && position <= apps.length) {
    return apps[position - 1];
  }

  return apps.find(
    (app) =>
      app.id.toLowerCase() === value || app.name.toLowerCase() === value,
  );
}

function formatDuration(milliseconds: number): string {
  return milliseconds < 1000
    ? `${milliseconds} ms`
    : `${(milliseconds / 1000).toFixed(1)} s`;
}

async function runApp(app: AppDefinition): Promise<void> {
  console.log(`\n> Ejecutando "${app.name}"...\n`);
  const startedAt = Date.now();

  try {
    await app.run();
    console.log(
      `\n[ok] "${app.name}" terminó en ${formatDuration(Date.now() - startedAt)}`,
    );
  } catch (error) {
    console.error(`\n[error] "${app.name}" falló:`);
    console.error(error instanceof Error ? error.message : error);
  }
}

/**
 * Flujo principal: muestra el menú, ejecuta la app elegida y vuelve al menú.
 * Si se pasa `appQuery`, ejecuta esa app una sola vez sin mostrar el menú.
 */
export async function runConsoleMenu(
  apps: readonly AppDefinition[],
  appQuery?: string,
): Promise<void> {
  if (apps.length === 0) {
    console.log(
      "No hay apps registradas. Agrega una entrada en src/apps/registry.ts",
    );
    return;
  }

  if (appQuery !== undefined) {
    const app = resolveApp(apps, appQuery);
    if (!app) {
      console.log(`No encontré la app "${appQuery}".`);
      listApps(apps);
      return;
    }

    await runApp(app);
    return;
  }

  while (true) {
    renderMenu(apps);

    const prompt = createPrompt();
    const answer = await prompt.ask("  App (número, id o 'q' para salir): ");
    prompt.close();

    if (answer === null || isExitCommand(answer)) {
      console.log("\nHasta luego.");
      return;
    }

    const app = resolveApp(apps, answer);
    if (!app) {
      if (answer.trim() !== "") {
        console.log(`  "${answer.trim()}" no es una opción válida.`);
      }
      continue;
    }

    await runApp(app);

    if (stdin.isTTY) {
      const pause = createPrompt();
      await pause.ask("\n  Enter para volver al menú...");
      pause.close();
    }
  }
}
