export declare class LocalAudioPlayer {
    private currentProcess;
    constructor();
    isPlaying(): boolean;
    private waitForPlaybackStart;
    private terminateAudioProcess;
    play(fileName: string, signal?: AbortSignal): Promise<{
        fileName: string;
        pid: number | null;
    }>;
    stop(): Promise<boolean>;
}
export declare const defaultAudioPlayer: LocalAudioPlayer;
//# sourceMappingURL=player.d.ts.map