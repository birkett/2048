import Tile from './Tile.js';
import Position2d from './Position2d';
import Direction from './Direction.js';

type NullableTile = Tile | null;
type TileArray = NullableTile[][];

export interface GridSerialized {
    size: number;
    tiles: TileArray;
}

export default class Grid implements GridSerialized {
    size: number;

    tiles: TileArray;

    constructor(size: number, previousState?: TileArray) {
        this.size = size;
        this.tiles = this.create(previousState);
    }

    create(state?: TileArray): TileArray {
        const tiles: TileArray = [];

        for (let x = 0; x < this.size; x += 1) {
            const row = [];

            for (let y = 0; y < this.size; y += 1) {
                const tile = state ? state[x][y] : null;

                row.push(tile ? new Tile(tile.position, tile.value) : null);
            }

            tiles[x] = <Tile[]>row;
        }

        return tiles;
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

        this.eachCell((tile: Tile, x: number, y: number) => {
            if (!tile) {
                cells.push({ x, y });
            }
        });

        return cells;
    }

    eachCell(callback: Function): void {
        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                callback(this.tiles[x][y], x, y);
            }
        }
    }

    cellsAvailable(): boolean {
        return !!this.availableCells().length;
    }

    cellAvailable(position: Position2d): boolean {
        return !this.cellOccupied(position);
    }

    cellOccupied(position: Position2d): boolean {
        return !!this.cellContent(position);
    }

    cellContent(position: Position2d): Tile | null {
        return this.withinBounds(position)
            ? this.tiles[position.x][position.y]
            : null;
    }

    insertTile(tile: Tile): void {
        this.setTile(tile.position, tile);
    }

    removeTile(tile: Tile): void {
        this.setTile(tile.position, null);
    }

    setTile(position: Position2d, tile: Tile | null): void {
        this.tiles[position.x][position.y] = tile;
    }

    withinBounds(position: Position2d): boolean {
        return position.x >= 0 && position.x < this.size
            && position.y >= 0 && position.y < this.size;
    }

    transpose(): void {
        const newCells = this.create();

        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                newCells[y][x] = this.tiles[x][y];
            }
        }

        this.tiles = newCells;
    }

    flipX(): void {
        this.tiles = this.tiles.reverse();

        this.updateTiles();
    }

    flipY(): void {
        this.tiles = this.tiles.map((row) => row.reverse());

        this.updateTiles();
    }

    rotate(direction: Direction): void {
        switch (direction) {
            case Direction.Left:
                this.transpose();
                this.flipY();

                break;
            case Direction.Right:
                this.transpose();
                this.flipX();

                break;
            default:
                break;
        }
    }

    updateTiles(): void {
        this.eachCell((tile: Tile, x: number, y: number) => {
            if (tile) {
                tile.updatePosition({ x, y });
            }
        });
    }

    serialize(): GridSerialized {
        const savedTiles: TileArray = [];

        for (let x = 0; x < this.size; x += 1) {
            const row = [];

            for (let y = 0; y < this.size; y += 1) {
                row.push(this.tiles[x][y] ? this.tiles[x][y]!.serialize() : null);
            }

            savedTiles[x] = <Tile[]>row;
        }

        return {
            size: this.size,
            tiles: savedTiles,
        };
    }
}
