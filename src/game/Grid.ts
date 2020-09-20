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
    public size: number;

    public tiles: TileArray;

    constructor(size: number, previousState?: TileArray) {
        this.size = size;
        this.tiles = this.create(previousState);
    }

    public randomAvailableCell(): Position2d | null {
        const cells = this.availableCells();

        if (cells.length) {
            return cells[Math.floor(Math.random() * cells.length)];
        }

        return null;
    }

    public eachCell(callback: Function): void {
        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                callback(this.tiles[x][y], { x, y });
            }
        }
    }

    public cellsAvailable(): boolean {
        return !!this.availableCells().length;
    }

    public cellAvailable(position: Position2d): boolean {
        return !this.cellOccupied(position);
    }

    public cellContent(position: Position2d): Tile | null {
        return this.withinBounds(position)
            ? this.tiles[position.x][position.y]
            : null;
    }

    public insertTile(tile: Tile): void {
        this.setTile(tile.position, tile);
    }

    public removeTile(tile: Tile): void {
        this.setTile(tile.position, null);
    }

    public setTile(position: Position2d, tile: Tile | null): void {
        this.tiles[position.x][position.y] = tile;
    }

    public withinBounds(position: Position2d): boolean {
        return position.x >= 0 && position.x < this.size
            && position.y >= 0 && position.y < this.size;
    }

    public flipX(): void {
        this.tiles = this.tiles.reverse();

        this.updateTiles();
    }

    public flipY(): void {
        this.tiles = this.tiles.map((row) => row.reverse());

        this.updateTiles();
    }

    public rotate(direction: Direction): void {
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

    public serialize(): GridSerialized {
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

    private create(state?: TileArray): TileArray {
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

    private availableCells(): Position2d[] {
        const cells: Position2d[] = [];

        this.eachCell((tile: Tile, position: Position2d) => {
            if (!tile) {
                cells.push(position);
            }
        });

        return cells;
    }

    private cellOccupied(position: Position2d): boolean {
        return !!this.cellContent(position);
    }

    private transpose(): void {
        const newCells = this.create();

        for (let x = 0; x < this.size; x += 1) {
            for (let y = 0; y < this.size; y += 1) {
                newCells[y][x] = this.tiles[x][y];
            }
        }

        this.tiles = newCells;
    }

    private updateTiles(): void {
        this.eachCell((tile: Tile, position: Position2d) => {
            if (tile) {
                tile.updatePosition(position);
            }
        });
    }
}
