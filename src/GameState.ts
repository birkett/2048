import Grid from './Grid';

export default interface GameState {
    grid?: Grid;
    moves: number;
    score: number;
    over: boolean;
    won: boolean;
    keepPlaying?: boolean;

    terminated?: boolean;
    bestScore?: number;
}
