import type { AppDefinition } from "../apps/types.js";
export interface CliOptions {
    help: boolean;
    list: boolean;
    app?: string;
}
export declare function parseCliOptions(argv: readonly string[]): CliOptions;
export declare function printHelp(apps: readonly AppDefinition[]): void;
export declare function listApps(apps: readonly AppDefinition[]): void;
/**
 * Flujo principal: muestra el menú, ejecuta la app elegida y vuelve al menú.
 * Si se pasa `appQuery`, ejecuta esa app una sola vez sin mostrar el menú.
 */
export declare function runConsoleMenu(apps: readonly AppDefinition[], appQuery?: string): Promise<void>;
//# sourceMappingURL=menu.d.ts.map