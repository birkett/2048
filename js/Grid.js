import Tile from './Tile.js';

export default class Grid {
    constructor(size, previousState) {
        this.size = size;
        this.cells = previousState ? this.fromState(previousState) : this.empty();
    }

    empty() {
        const cells = [];

        for (let x = 0; x < this.size; x += 1) {
            const row = [];

            for (let y = 0; y < this.size; y += 1) {
                row.push(null);
            }

            cells[x] = row;
        }

        return cells;
    }

    fromState(state) {
        const cells = [];

        for (let x = 0; x < this.size; x += 1) {
            const row = [];

            for (let y = 0; y < this.size; y += 1) {
                const tile = state[x][y];
                row.push(tile ? new Tile(tile.position, tile.value) : null);
            }

            cells[x] = row;
        }

        return cells;
    }

    randomAvailableCell() {
        const cells = this.availableCells();

        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }

        return [];
    }

    availableCells() {
        const cells = [];

        this.eachCell((x, y, tile) => {
            if (!tile) {
                cells.push({ x, y });
            }
        });

        return cells;
    }

    eachCell(callback) {
        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                callback(x, y, this.cells[x][y]);
            }
        }
    }

    cellsAvailable() {
        return !!this.availableCells().length;
    }

    cellAvailable(cell) {
        return !this.cellOccupied(cell);
    }

    cellOccupied(cell) {
        return !!this.cellContent(cell);
    }

    cellContent(cell) {
        if (this.withinBounds(cell)) {
            return this.cells[cell.x][cell.y];
        }
        return null;
    }

    insertTile(tile) {
        this.cells[tile.x][tile.y] = tile;
    }

    removeTile(tile) {
        this.cells[tile.x][tile.y] = null;
    }

    withinBounds(position) {
        return position.x >= 0 && position.x < this.size
        && position.y >= 0 && position.y < this.size;
    }

    transpose() {
        const newCells = this.empty();

        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                newCells[y][x] = this.cells[x][y];
            }
        }

        this.cells = newCells;
    }

    flipX(hold) {
        this.cells = this.cells.reverse();

        if (hold) {
            return;
        }

        this.updateTiles();
    }

    flipY(hold) {
        this.cells = this.cells.map((row) => row.reverse());

        if (hold) {
            return;
        }

        this.updateTiles();
    }

    rotate(n) {
        switch (((n % 4) + 4) % 4) {
            case 1:
                this.transpose();
                this.flipX();

                break;
            case 2:
                this.flipX(true);
                this.flipY();

                break;
            case 3:
                this.transpose();
                this.flipY();

                break;
            default:
                break;
        }
    }

    updateTiles() {
        this.eachCell((x, y, tile) => {
            if (tile) {
                tile.updatePosition({ x, y });
            }
        });
    }

    serialize() {
        const cellState = [];

        for (let x = 0; x < this.size; x += 1) {
            const row = [];

            for (let y = 0; y < this.size; y += 1) {
                row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
            }

            cellState[x] = row;
        }

        return {
            size: this.size,
            cells: cellState,
        };
    }
}
