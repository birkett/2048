import GameState from "./GameState";

export default class LocalStorageManager {
    bestScoreKey: string;
    gameStateKey: string;
    storage: Storage;

    constructor() {
        this.bestScoreKey = 'bestScore';
        this.gameStateKey = 'gameState';
        this.storage = window.localStorage;
    }

    getBestScore() {
        return Number(this.storage.getItem(this.bestScoreKey)) || 0;
    }

    setBestScore(score: number) {
        this.storage.setItem(this.bestScoreKey, score.toString());
    }

    getGameState() {
        const stateJSON = this.storage.getItem(this.gameStateKey);

        return stateJSON ? JSON.parse(stateJSON) : null;
    }

    setGameState(gameState: GameState) {
        this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    }

    clearGameState() {
        this.storage.removeItem(this.gameStateKey);
    }
}
