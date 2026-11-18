import { apps } from "./apps/registry.js";
import {
  listApps,
  parseCliOptions,
  printHelp,
  runConsoleMenu,
} from "./cli/menu.js";

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));

  if (options.help) {
    printHelp(apps);
    return;
  }

  if (options.list) {
    listApps(apps);
    return;
  }

  await runConsoleMenu(apps, options.app);
}

main().catch((error: unknown) => {
  console.error("Error inesperado en el selector de apps:", error);
  process.exitCode = 1;
});