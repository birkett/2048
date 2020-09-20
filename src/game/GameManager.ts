import Grid from './Grid.js';
import GameState from './GameState';
import Tile from './Tile.js';
import KeyboardInputManager from './KeyboardInputManager';
import HtmlActuator from './HtmlActuator';
import LocalStorageManager from './LocalStorageManager';
import Position2d from './Position2d';
import GameConfig from './GameConfig';
import Direction from './Direction.js';

interface Traversals {
    x: number[];
    y: number[];
}

const VECTOR_MAP: Record<Direction, Position2d> = {
    [Direction.Up]: { x: 0, y: -1 },
    [Direction.Right]: { x: 1, y: 0 },
    [Direction.Down]: { x: 0, y: 1 },
    [Direction.Left]: { x: -1, y: 0 },
};

const getVector = (direction: Direction): Position2d => VECTOR_MAP[direction];

const positionsEqual = (a: Position2d, b: Position2d): boolean => a.x === b.x && a.y === b.y;

export default class GameManager implements GameState {
    public keepPlaying: boolean;

    public over: boolean;

    public won: boolean;

    public grid: Grid;

    public moves: number;

    public score: number;

    private readonly size: number;

    private inputManager: KeyboardInputManager;

    private storageManager: LocalStorageManager;

    private actuator: HtmlActuator;

    private readonly startTiles: number;

    private readonly undoLimit: number;

    private stateHistory: GameState[];

    private readonly winningValue: number;

    constructor(
        config: GameConfig,
        inputManager: KeyboardInputManager,
        actuator: HtmlActuator,
        storageManager: LocalStorageManager,
    ) {
        this.size = config.boardSize;
        this.inputManager = inputManager;
        this.storageManager = storageManager;
        this.actuator = actuator;

        this.startTiles = config.startingTiles;
        this.undoLimit = config.undoLimit;
        this.winningValue = config.winningValue;

        this.stateHistory = [];
        this.keepPlaying = false;
        this.over = false;
        this.won = false;
        this.grid = new Grid(this.size);
        this.moves = 0;
        this.score = 0;

        this.inputManager.on('move', this.move.bind(this));
        this.inputManager.on('rotate', this.rotate.bind(this));
        this.inputManager.on('flipX', this.flipX.bind(this));
        this.inputManager.on('flipY', this.flipY.bind(this));
        this.inputManager.on('restart', this.restart.bind(this));
        this.inputManager.on('restartWithConfirmation', this.restartWithConfirmation.bind(this));
        this.inputManager.on('keepPlaying', this.keepPlayingListener.bind(this));
        this.inputManager.on('undo', this.undo.bind(this));

        this.setup();
    }

    public begin(): void {
        this.actuate();
    }

    private restart(): void {
        this.storageManager.clearGameState();
        this.actuator.continueGame();
        this.setup();
        this.begin();
    }

    private restartWithConfirmation(): void {
        this.actuator.promptRestart();
    }

    private keepPlayingListener(): void {
        this.keepPlaying = true;
        this.actuator.continueGame();
    }

    private undo(): void {
        if (!this.stateHistory || !this.stateHistory.length) {
            return;
        }

        if (this.over) {
            this.actuator.continueGame();
        }

        const targetState = this.stateHistory.splice(this.stateHistory.length - 1, 1)[0];

        this.loadFromPreviousState(targetState);

        this.actuate();
    }

    private isGameTerminated(): boolean {
        return this.over || (this.won && !this.keepPlaying);
    }

    private setup(): void {
        this.actuator.buildHTMLGrid(this.size);

        const previousState = this.storageManager.getGameState();

        // Reload the game from a previous game if present
        if (previousState) {
            this.loadFromPreviousState(previousState);
        } else {
            this.createNewState();
        }
    }

    private createNewState(): void {
        this.grid = new Grid(this.size);
        this.moves = -1;
        this.score = 0;
        this.over = false;
        this.won = false;
        this.keepPlaying = false;

        this.addStartTiles();
    }

    private loadFromPreviousState(previousState: GameState): void {
        this.grid = new Grid(previousState.grid!.size, previousState.grid!.tiles);
        this.moves = previousState.moves;
        this.score = previousState.score;
        this.over = previousState.over;
        this.won = previousState.won;
        this.keepPlaying = previousState.keepPlaying!;
    }

    private addStartTiles(): void {
        for (let i = 0; i < this.startTiles; i += 1) {
            this.addRandomTile();
        }
    }

    private addRandomTile(): void {
        if (!this.grid.cellsAvailable()) {
            return;
        }

        const value = Math.random() < 0.9 ? 2 : 4;
        const tile = new Tile(this.grid.randomAvailableCell()!, value);

        this.grid.insertTile(tile);
    }

    private actuate(): void {
        if (this.storageManager.getBestScore() < this.score) {
            this.storageManager.setBestScore(this.score);
        }

        if (this.over) {
            this.storageManager.clearGameState();
        } else {
            this.storageManager.setGameState(this.serialize());
        }

        this.actuator.actuate(this.grid, {
            moves: this.moves += 1,
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storageManager.getBestScore(),
            terminated: this.isGameTerminated(),
        });
    }

    private serialize(): GameState {
        return {
            grid: this.grid.serialize(),
            moves: this.moves,
            score: this.score,
            over: this.over,
            won: this.won,
            keepPlaying: this.keepPlaying,
        };
    }

    private prepareTiles(): void {
        this.grid.eachCell((tile: Tile) => {
            if (!tile) {
                return;
            }

            tile.setMergedFrom(null);
            tile.savePosition();
        });
    }

    private moveTile(tile: Tile, position: Position2d): void {
        this.grid.setTile(tile.position, null);
        this.grid.setTile(position, tile);

        tile.updatePosition(position);
    }

    private move(direction: Direction): void {
        const self = this;

        if (this.isGameTerminated()) {
            return;
        }

        let cell;
        let tile;

        const vector = getVector(direction);
        const traversals = this.buildTraversals(vector);
        let moved = false;

        const currentState = this.storageManager.getGameState();

        // Save the current tile positions and remove merger information
        this.prepareTiles();

        // Traverse the grid in the right direction and move tiles
        traversals.x.forEach((x) => {
            traversals.y.forEach((y) => {
                cell = { x, y };
                tile = self.grid.cellContent(cell);

                if (!tile) {
                    return;
                }

                const positions = self.findFarthestPosition(cell, vector);
                const next = self.grid.cellContent(positions.next);

                // Only one merger per row traversal?
                if (next && next.value === tile.value && !next.mergedFrom) {
                    const merged = new Tile(positions.next, tile.value * 2);
                    merged.mergedFrom = [tile, next];

                    self.grid.insertTile(merged);
                    self.grid.removeTile(tile);

                    tile.updatePosition(positions.next);

                    self.score += merged.value;

                    self.won = self.won || merged.value === this.winningValue;
                } else {
                    self.moveTile(tile, positions.farthest);
                }

                if (!positionsEqual(cell, tile.position)) {
                    moved = true;
                }
            });
        });

        if (!moved) {
            return;
        }

        if (this.stateHistory.length === this.undoLimit) {
            this.stateHistory.splice(0, 1);
            this.stateHistory = this.stateHistory.filter(Boolean);
        }

        if (this.stateHistory.length < this.undoLimit) {
            this.stateHistory.push(currentState!);
        }

        this.addRandomTile();

        this.over = !this.movesAvailable(); // Game over!

        this.actuate();
    }

    private rotate(n: Direction): void {
        if (this.over) {
            return;
        }

        this.prepareTiles();
        this.grid.rotate(n);
        this.actuate();
    }

    private flipX(): void {
        if (this.over) {
            return;
        }

        this.prepareTiles();
        this.grid.flipX();
        this.actuate();
    }

    private flipY(): void {
        if (this.over) {
            return;
        }

        this.prepareTiles();
        this.grid.flipY();
        this.actuate();
    }

    private buildTraversals(vector: Position2d): Traversals {
        const traversals: Traversals = { x: [], y: [] };

        for (let pos = 0; pos < this.size; pos += 1) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        // Always traverse from the farthest cell in the chosen direction
        if (vector.x === 1) {
            traversals.x = traversals.x.reverse();
        }

        if (vector.y === 1) {
            traversals.y = traversals.y.reverse();
        }

        return traversals;
    }

    private findFarthestPosition(cell: Position2d, vector: Position2d) {
        let previous;

        // Progress towards the vector direction until an obstacle is found
        do {
            previous = cell;
            /* eslint-disable no-param-reassign */
            cell = { x: previous.x + vector.x, y: previous.y + vector.y };
            /* eslint-enable no-param-reassign */
        } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

        return {
            farthest: previous,
            next: cell, // Used to check if a merge is required
        };
    }

    private movesAvailable(): boolean {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    }

    private tileMatchesAvailable(): boolean {
        const self = this;

        let tile;

        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                tile = this.grid.cellContent({ x, y });

                if (!tile) {
                    continue;
                }

                const keys = <Direction[]>Object.keys(VECTOR_MAP);

                for (let i = 0; i < keys.length; i += 1) {
                    const vector = getVector(keys[i]);
                    const cell = { x: x + vector.x, y: y + vector.y };

                    const other = self.grid.cellContent(cell);

                    if (other && other.value === tile.value) {
                        return true; // These two tiles can be merged
                    }
                }
            }
        }

        return false;
    }
}
