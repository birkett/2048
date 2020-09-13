import Tile from './Tile.js';

export default class Grid {
    size: number;
    cells: Tile[][];

    constructor(size: number, previousState?: Tile[][]) {
        this.size = size;
        this.cells = this.create(previousState);
    }

    create(state?: Tile[][]) {
        const cells: Tile[][] = [];

        for (let x = 0; x < this.size; x += 1) {
            const row = [];

            for (let y = 0; y < this.size; y += 1) {
                const tile = state ? state[x][y] : null;

                row.push(tile ? new Tile({x: tile.x, y: tile.y}, tile.value) : null);
            }

            cells[x] = <Tile[]>row;
        }

        return cells;
    }

    randomAvailableCell() {
        const cells = this.availableCells();

        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }

        return null;
    }

    availableCells() {
        const cells: Position2d[] = [];

        this.eachCell((x: number, y: number, tile: Tile) => {
            if (!tile) {
                cells.push({ x, y });
            }
        });

        return cells;
    }

    eachCell(callback: Function) {
        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                callback(x, y, this.cells[x][y]);
            }
        }
    }

    cellsAvailable() {
        return !!this.availableCells().length;
    }

    cellAvailable(cell: Position2d) {
        return !this.cellOccupied(cell);
    }

    cellOccupied(cell: Position2d) {
        return !!this.cellContent(cell);
    }

    cellContent(cell: Position2d) {
        return this.withinBounds(cell)
            ? this.cells[cell.x][cell.y]
            : null;
    }

    insertTile(tile: Tile) {
        this.cells[tile.x][tile.y] = tile;
    }

    removeTile(tile: Tile) {
        this.cells[tile.x][tile.y] = <Tile><unknown>null;
    }

    withinBounds(position: Position2d) {
        return position.x >= 0 && position.x < this.size
            && position.y >= 0 && position.y < this.size;
    }

    transpose() {
        const newCells = this.create();

        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                newCells[y][x] = this.cells[x][y];
            }
        }

        this.cells = newCells;
    }

    flipX(hold?: boolean) {
        this.cells = this.cells.reverse();

        if (!hold) {
            this.updateTiles();
        }
    }

    flipY(hold?: boolean) {
        this.cells = this.cells.map((row) => row.reverse());

        if (!hold) {
            this.updateTiles();
        }
    }

    rotate(n: number) {
        switch (((n % this.size) + this.size) % this.size) {
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
        this.eachCell((x: number, y: number, tile: Tile) => {
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
