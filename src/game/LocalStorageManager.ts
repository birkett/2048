import GameState from './GameState';

export default class LocalStorageManager {
    private readonly bestScoreKey: string;

    private readonly gameStateKey: string;

    private storage: Storage;

    constructor() {
        this.bestScoreKey = 'bestScore';
        this.gameStateKey = 'gameState';
        this.storage = window.localStorage;
    }

    public getBestScore(): number {
        return Number(this.storage.getItem(this.bestScoreKey)) || 0;
    }

    public setBestScore(score: number): void {
        this.storage.setItem(this.bestScoreKey, score.toString());
    }

    public getGameState(): GameState | null {
        const stateJSON = this.storage.getItem(this.gameStateKey);

        return stateJSON ? JSON.parse(stateJSON) : null;
    }

    public setGameState(gameState: GameState): void {
        this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    }

    public clearGameState(): void {
        this.storage.removeItem(this.gameStateKey);
    }
}
