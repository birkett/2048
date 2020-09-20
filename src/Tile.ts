import Position2d from './Position2d';

interface TileSerialized {
    position: Position2d;
    value: number;
}

export default class Tile implements TileSerialized {
    public position: Position2d;

    public value: number;

    public previousPosition: Position2d | null;

    public mergedFrom: Tile[] | null;

    constructor(position: Position2d, value: number) {
        this.position = position;
        this.value = value;

        this.previousPosition = null;
        this.mergedFrom = null; // Tracks tiles that merged together
    }

    public setMergedFrom(value: Tile[] | null): void {
        this.mergedFrom = value;
    }

    public savePosition(): void {
        this.previousPosition = this.position;
    }

    public updatePosition(position: Position2d): void {
        this.position = position;
    }

    public serialize(): TileSerialized {
        return {
            position: this.position,
            value: this.value,
        };
    }
}
