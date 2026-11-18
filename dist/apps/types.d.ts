export type AppRunner = () => void | Promise<void>;
export interface AppDefinition {
    /** Identificador corto usado por la CLI (ej. "chat-memory"). */
    id: string;
    /** Nombre visible en el menú. */
    name: string;
    /** Texto opcional que se muestra bajo el nombre. */
    description?: string;
    /** Punto de entrada de la app. */
    run: AppRunner;
}
//# sourceMappingURL=types.d.ts.map