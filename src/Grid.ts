import Tile from './Tile.js';
import Position2d from './Position2d';

type TileArray = Tile[][];

export default class Grid {
    size: number;

    cells: TileArray;

    constructor(size: number, previousState?: TileArray) {
        this.size = size;
        this.cells = this.create(previousState);
    }

    create(state?: TileArray): TileArray {
        const cells: TileArray = [];

        for (let x = 0; x < this.size; x += 1) {
            const row = [];

            for (let y = 0; y < this.size; y += 1) {
                const tile = state ? state[x][y] : null;

                row.push(tile ? new Tile({ x: tile.x, y: tile.y }, tile.value) : null);
            }

            cells[x] = <Tile[]>row;
        }

        return cells;
    }

    randomAvailableCell(): Position2d | null {
        const cells = this.availableCells();

        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }

        return null;
    }

    availableCells(): Position2d[] {
        const cells: Position2d[] = [];

        this.eachCell((x: number, y: number, tile: Tile) => {
            if (!tile) {
                cells.push({ x, y });
            }
        });

        return cells;
    }

    eachCell(callback: Function): void {
        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                callback(x, y, this.cells[x][y]);
            }
        }
    }

    cellsAvailable(): boolean {
        return !!this.availableCells().length;
    }

    cellAvailable(cell: Position2d): boolean {
        return !this.cellOccupied(cell);
    }

    cellOccupied(cell: Position2d): boolean {
        return !!this.cellContent(cell);
    }

    cellContent(cell: Position2d): Tile | null {
        return this.withinBounds(cell)
            ? this.cells[cell.x][cell.y]
            : null;
    }

    insertTile(tile: Tile): void {
        this.cells[tile.x][tile.y] = tile;
    }

    removeTile(tile: Tile): void {
        this.cells[tile.x][tile.y] = <Tile><unknown>null;
    }

    withinBounds(position: Position2d): boolean {
        return position.x >= 0 && position.x < this.size
            && position.y >= 0 && position.y < this.size;
    }

    transpose(): void {
        const newCells = this.create();

        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                newCells[y][x] = this.cells[x][y];
            }
        }

        this.cells = newCells;
    }

    flipX(hold?: boolean): void {
        this.cells = this.cells.reverse();

        if (!hold) {
            this.updateTiles();
        }
    }

    flipY(hold?: boolean): void {
        this.cells = this.cells.map((row) => row.reverse());

        if (!hold) {
            this.updateTiles();
        }
    }

    rotate(n: number): void {
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

    updateTiles(): void {
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
