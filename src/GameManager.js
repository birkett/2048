import Grid from './Grid.js';
import Tile from './Tile.js';

const VECTOR_MAP = {
    Up: { x: 0, y: -1 },
    Right: { x: 1, y: 0 },
    Down: { x: 0, y: 1 },
    Left: { x: -1, y: 0 },
};

const getVector = (direction) => VECTOR_MAP[direction];

const positionsEqual = (first, second) => first.x === second.x && first.y === second.y;

export default class GameManager {
    constructor(size, InputManager, Actuator, StorageManager) {
        this.size = size;
        this.inputManager = new InputManager();
        this.storageManager = new StorageManager();
        this.actuator = new Actuator();

        this.startTiles = 2;

        this.undoLimit = 5;
        this.stateHistory = [];

        this.inputManager.on('move', this.move.bind(this));
        this.inputManager.on('rotate', this.rotate.bind(this));
        this.inputManager.on('flipX', this.flipX.bind(this));
        this.inputManager.on('flipY', this.flipY.bind(this));
        this.inputManager.on('restart', this.restart.bind(this));
        this.inputManager.on('restartWithConfirmation', this.restartWithConfirmation.bind(this));
        this.inputManager.on('keepPlaying', this.keepPlaying.bind(this));
        this.inputManager.on('undo', this.undo.bind(this));

        this.setup();
    }

    begin() {
        this.actuate();
    }

    restart() {
        this.storageManager.clearGameState();
        this.actuator.continueGame();
        this.setup();
        this.begin();
    }

    restartWithConfirmation() {
        this.actuator.promptRestart();
    }

    keepPlaying() {
        this.keepPlaying = true;
        this.actuator.continueGame();
    }

    undo() {
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

    isGameTerminated() {
        return this.over || (this.won && !this.keepPlaying);
    }

    setup() {
        this.actuator.buildHTMLGrid(this.size);

        const previousState = this.storageManager.getGameState();

        // Reload the game from a previous game if present
        if (previousState) {
            this.loadFromPreviousState(previousState);
        } else {
            this.createNewState();
        }
    }

    createNewState() {
        this.grid = new Grid(this.size);
        this.moves = -1;
        this.score = 0;
        this.over = false;
        this.won = false;
        this.keepPlaying = false;

        this.addStartTiles();
    }

    loadFromPreviousState(previousState) {
        this.grid = new Grid(previousState.grid.size, previousState.grid.cells);
        this.moves = previousState.moves;
        this.score = previousState.score;
        this.over = previousState.over;
        this.won = previousState.won;
        this.keepPlaying = previousState.keepPlaying;
    }

    addStartTiles() {
        for (let i = 0; i < this.startTiles; i += 1) {
            this.addRandomTile();
        }
    }

    addRandomTile() {
        if (!this.grid.cellsAvailable()) {
            return;
        }

        const value = Math.random() < 0.9 ? 2 : 4;
        const tile = new Tile(this.grid.randomAvailableCell(), value);

        this.grid.insertTile(tile);
    }

    actuate() {
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

    serialize() {
        return {
            grid: this.grid.serialize(),
            moves: this.moves,
            score: this.score,
            over: this.over,
            won: this.won,
            keepPlaying: this.keepPlaying,
        };
    }

    prepareTiles() {
        this.grid.eachCell((x, y, tile) => {
            if (!tile) {
                return;
            }

            tile.setMergedFrom(null);
            tile.savePosition();
        });
    }

    moveTile(tile, cell) {
        this.grid.cells[tile.x][tile.y] = null;
        this.grid.cells[cell.x][cell.y] = tile;

        tile.updatePosition(cell);
    }

    move(direction) {
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

                    // The mighty 2048 tile
                    self.won = merged.value === 2048;
                } else {
                    self.moveTile(tile, positions.farthest);
                }

                if (!positionsEqual(cell, tile)) {
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
            this.stateHistory.push(currentState);
        }

        this.addRandomTile();

        this.over = !this.movesAvailable(); // Game over!

        this.actuate();
    }

    rotate(n) {
        if (this.over) {
            return;
        }

        this.prepareTiles();
        this.grid.rotate(n);
        this.actuate();
    }

    flipX() {
        if (this.over) {
            return;
        }

        this.prepareTiles();
        this.grid.flipX();
        this.actuate();
    }

    flipY() {
        if (this.over) {
            return;
        }

        this.prepareTiles();
        this.grid.flipY();
        this.actuate();
    }

    buildTraversals(vector) {
        const traversals = { x: [], y: [] };

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

    findFarthestPosition(cell, vector) {
        let previous;

        // Progress towards the vector direction until an obstacle is found
        do {
            previous = cell;
            cell = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

        return {
            farthest: previous,
            next: cell, // Used to check if a merge is required
        };
    }

    movesAvailable() {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable();
    }

    tileMatchesAvailable() {
        const self = this;

        let tile;

        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                tile = this.grid.cellContent({ x, y });

                if (!tile) {
                    continue;
                }

                const keys = Object.keys(VECTOR_MAP);

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
