import GameState from './GameState';

export default class LocalStorageManager {
    bestScoreKey: string;

    gameStateKey: string;

    storage: Storage;

    constructor() {
        this.bestScoreKey = 'bestScore';
        this.gameStateKey = 'gameState';
        this.storage = window.localStorage;
    }

    getBestScore(): number {
        return Number(this.storage.getItem(this.bestScoreKey)) || 0;
    }

    setBestScore(score: number): void {
        this.storage.setItem(this.bestScoreKey, score.toString());
    }

    getGameState(): GameState | null {
        const stateJSON = this.storage.getItem(this.gameStateKey);

        return stateJSON ? JSON.parse(stateJSON) : null;
    }

    setGameState(gameState: GameState): void {
        this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    }

    clearGameState(): void {
        this.storage.removeItem(this.gameStateKey);
    }
}
