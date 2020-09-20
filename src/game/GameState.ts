import { GridSerialized } from './Grid';

export default interface GameState {
    grid?: GridSerialized;
    moves: number;
    score: number;
    over: boolean;
    won: boolean;
    keepPlaying?: boolean;

    terminated?: boolean;
    bestScore?: number;
}
