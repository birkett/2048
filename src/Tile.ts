import Position2d from './Position2d';

interface TileSerialized {
    position: Position2d;
    value: number;
}

export default class Tile implements TileSerialized {
    position: Position2d;

    value: number;

    previousPosition: Position2d | null;

    mergedFrom: Tile[] | null;

    constructor(position: Position2d, value: number) {
        this.position = position;
        this.value = value;

        this.previousPosition = null;
        this.mergedFrom = null; // Tracks tiles that merged together
    }

    setMergedFrom(value: Tile[] | null): void {
        this.mergedFrom = value;
    }

    savePosition(): void {
        this.previousPosition = this.position;
    }

    updatePosition(position: Position2d): void {
        this.position = position;
    }

    serialize(): TileSerialized {
        return {
            position: this.position,
            value: this.value,
        };
    }
}
