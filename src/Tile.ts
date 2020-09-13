export default class Tile implements Position2d {
    x: number;
    y: number;
    value: number;
    previousPosition: Position2d | null;
    mergedFrom: Tile[] | null;

    constructor(position: Position2d, value: number) {
        this.x = position.x;
        this.y = position.y;
        this.value = value || 2;

        this.previousPosition = null;
        this.mergedFrom = null; // Tracks tiles that merged together
    }

    setMergedFrom(value: Tile[] | null) {
        this.mergedFrom = value;
    }

    savePosition() {
        this.previousPosition = { x: this.x, y: this.y };
    }

    updatePosition(position: Position2d) {
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
