import Position2d from './Position2d';

export default class Tile implements Position2d {
    x: number;

    y: number;

    value: number;

    previousPosition: Position2d | null;

    mergedFrom: Tile[] | null;

    constructor(position: Position2d, value: number) {
        this.x = position.x;
        this.y = position.y;
        this.value = value;

        this.previousPosition = null;
        this.mergedFrom = null; // Tracks tiles that merged together
    }

    setMergedFrom(value: Tile[] | null): void {
        this.mergedFrom = value;
    }

    savePosition(): void {
        this.previousPosition = { x: this.x, y: this.y };
    }

    updatePosition(position: Position2d): void {
        this.x = position.x;
        this.y = position.y;
    }

    serialize() {
        return {
            x: this.x,
            y: this.y,
            value: this.value,
        };
    }
}
