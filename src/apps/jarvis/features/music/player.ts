import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createLogger } from "../../../../core/utils/logger.js";

const logger = createLogger("LocalAudioPlayer");

export class LocalAudioPlayer {
  private currentProcess: ChildProcess | null = null;

  constructor() {
    process.on("exit", () => {
      this.currentProcess?.kill();
    });
  }

  isPlaying(): boolean {
    return this.currentProcess !== null && this.currentProcess.exitCode === null;
  }

  private waitForPlaybackStart(
    child: ChildProcess,
    signal?: AbortSignal
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let settled = false;
      let errorOutput = "";

      const timeout = setTimeout(() => {
        finish(new Error("PowerShell no confirmó el inicio de la reproducción."));
      }, 10_000);

      const finish = (error?: Error): void => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        signal?.removeEventListener("abort", onAbort);
        if (error) reject(error);
        else resolve();
      };

      const onAbort = (): void => {
        finish(signal?.reason ?? new Error("La reproducción fue cancelada."));
      };

      if (!child.stdout || !child.stderr) {
        finish(new Error("No se pudo capturar la confirmación del reproductor."));
        return;
      }

      child.stdout.on("data", (chunk: Buffer) => {
        if (chunk.toString().includes("JARVIS_PLAYBACK_STARTED")) finish();
      });

      child.stderr.on("data", (chunk: Buffer) => {
        errorOutput += chunk.toString();
      });

      child.once("error", finish);
      child.once("exit", (code) => {
        if (!settled) {
          finish(
            new Error(
              errorOutput.trim() || `PowerShell terminó antes de iniciar la música (código ${code}).`
            )
          );
        }
      });

      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) onAbort();
    });
  }

  private async terminateAudioProcess(child: ChildProcess): Promise<void> {
    if (child.exitCode !== null || child.signalCode !== null) return;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        child.off("exit", onExit);
        reject(new Error("No se confirmó que el proceso de audio se haya detenido."));
      }, 3_000);

      const onExit = (): void => {
        clearTimeout(timeout);
        resolve();
      };

      child.once("exit", onExit);

      if (!child.kill()) {
        if (child.exitCode !== null || child.signalCode !== null) {
          onExit();
        } else {
          clearTimeout(timeout);
          child.off("exit", onExit);
          reject(new Error("No se pudo detener el proceso de audio."));
        }
      }
    });
  }

  async play(fileName: string, signal?: AbortSignal): Promise<{
    fileName: string;
    pid: number | null;
  }> {
    const filePath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`No encontré el archivo ${fileName} en la carpeta del proyecto.`);
    }

    const previousProcess = this.currentProcess;
    const psScript = `
      $ErrorActionPreference = 'Stop'
      Add-Type -AssemblyName presentationCore
      $player = New-Object System.Windows.Media.MediaPlayer
      $player.Open([Uri]'${filePath.replace(/'/g, "''")}')
      $player.Play()
      [Console]::Out.WriteLine('JARVIS_PLAYBACK_STARTED')
      [Console]::Out.Flush()
      while ($true) { Start-Sleep -Milliseconds 500 }
    `;

    const nextProcess = spawn(
      "powershell",
      ["-NoProfile", "-WindowStyle", "Hidden", "-Command", psScript],
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    let nextProcessExited = false;
    nextProcess.once("exit", () => {
      nextProcessExited = true;
      if (this.currentProcess === nextProcess) this.currentProcess = null;
    });

    try {
      await this.waitForPlaybackStart(nextProcess, signal);
    } catch (error) {
      nextProcess.kill();
      throw error;
    }

    if (
      nextProcessExited ||
      nextProcess.exitCode !== null ||
      nextProcess.signalCode !== null
    ) {
      throw new Error("El reproductor terminó antes de confirmar la reproducción.");
    }

    if (previousProcess && previousProcess !== nextProcess) {
      try {
        await this.terminateAudioProcess(previousProcess);
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        nextProcess.kill();
        throw new Error(`No se pudo detener la reproducción anterior: ${detail}`);
      }
    }

    if (nextProcessExited) {
      throw new Error("El reproductor terminó antes de confirmar la reproducción.");
    }

    this.currentProcess = nextProcess;
    logger.info("Reproducción iniciada", { fileName: path.basename(filePath), pid: nextProcess.pid });

    return {
      fileName: path.basename(filePath),
      pid: nextProcess.pid ?? null,
    };
  }

  async stop(): Promise<boolean> {
    const active = this.currentProcess;
    if (!active) return false;

    await this.terminateAudioProcess(active);
    if (this.currentProcess === active) this.currentProcess = null;
    logger.info("Reproducción detenida");
    return true;
  }
}

export const defaultAudioPlayer = new LocalAudioPlayer();
