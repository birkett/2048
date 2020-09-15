import Tile from './Tile';
import GameState from './GameState';
import Grid from './Grid';
import Position2d from './Position2d';

const clearContainer = (container: Element): void => {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

const applyClasses = (element: Element, classes: string[]): void => {
    element.setAttribute('class', classes.join(' '));
};

const positionClass = (pos: Position2d): string => `tile-position-${pos.x + 1}-${pos.y + 1}`;

export default class HtmlActuator {
    tileContainer: Element;

    movesContainer: Element;

    scoreContainer: Element;

    bestContainer: Element;

    messageContainer: Element;

    gridContainer: Element;

    score: number;

    constructor() {
        this.tileContainer = document.querySelector('.tile-container')!;
        this.movesContainer = document.querySelector('.moves-container')!;
        this.scoreContainer = document.querySelector('.score-container')!;
        this.bestContainer = document.querySelector('.best-container')!;
        this.messageContainer = document.querySelector('.game-message')!;
        this.gridContainer = document.querySelector('.grid-container')!;

        this.score = 0;

        if (
            !this.tileContainer || !this.movesContainer || !this.scoreContainer
            || !this.bestContainer || !this.messageContainer || !this.gridContainer
        ) {
            throw new Error('Containers not found.');
        }
    }

    buildHTMLGrid(size: number): void {
        if (this.gridContainer.children.length >= size) {
            return;
        }

        for (let y = 0; y < size; y += 1) {
            const row = document.createElement('div');

            row.className = 'grid-row';

            for (let x = 0; x < size; x += 1) {
                const cell = document.createElement('div');

                cell.className = 'grid-cell';

                row.appendChild(cell);
            }

            this.gridContainer.appendChild(row);
        }
    }

    actuate(grid: Grid, metadata: GameState): void {
        const self = this;

        window.requestAnimationFrame(() => {
            clearContainer(self.tileContainer);

            grid.tiles.forEach((column) => {
                column.forEach((tile) => {
                    if (tile) {
                        self.addTile(tile);
                    }
                });
            });

            self.updateMoves(metadata.moves);
            self.updateScore(metadata.score);
            self.updateBestScore(metadata.bestScore!);

            if (metadata.terminated) {
                if (metadata.won) {
                    self.message(true); // You win!
                } else if (metadata.over) {
                    self.message(false); // You lose
                }
            }
        });
    }

    continueGame(): void {
        this.clearMessage();
    }

    addTile(tile: Tile): void {
        const self = this;

        const wrapper = document.createElement('div');
        const inner = document.createElement('div');
        const position = tile.previousPosition || tile.position;
        const positionClassString = positionClass(position);

        // We can't use classlist because it somehow glitches when replacing classes
        const classes = ['tile', `tile-${tile.value}`, positionClassString];

        applyClasses(wrapper, classes);

        inner.classList.add('tile-inner');
        inner.textContent = tile.value.toString();

        if (tile.previousPosition) {
            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(() => {
                classes[2] = positionClass(tile.position);
                applyClasses(wrapper, classes); // Update the position
            });
        } else if (tile.mergedFrom) {
            classes.push('tile-merged');
            applyClasses(wrapper, classes);

            // Render the tiles that merged
            tile.mergedFrom.forEach((merged) => {
                self.addTile(merged);
            });
        } else {
            classes.push('tile-new');
            applyClasses(wrapper, classes);
        }

        // Add the inner part of the tile to the wrapper
        wrapper.appendChild(inner);

        // Put the tile on the board
        this.tileContainer.appendChild(wrapper);
    }

    updateMoves(moves: number): void {
        this.movesContainer.textContent = moves.toString();
    }

    updateScore(score: number): void {
        clearContainer(this.scoreContainer);

        const difference = score - this.score;
        this.score = score;

        this.scoreContainer.textContent = this.score.toString();

        if (difference > 0) {
            const addition = document.createElement('div');
            addition.classList.add('score-addition');
            addition.textContent = `+${difference}`;

            this.scoreContainer.appendChild(addition);
        }
    }

    updateBestScore(bestScore: number): void {
        this.bestContainer.textContent = bestScore.toString();
    }

    message(won: boolean): void {
        const type = won ? 'game-won' : 'game-over';
        const message = won ? 'You win!' : 'Game over!';

        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName('p')[0].textContent = message;
    }

    promptRestart(): void {
        const message = 'Start a new game?';

        this.messageContainer.classList.add('restart-game');
        this.messageContainer.getElementsByTagName('p')[0].textContent = message;
    }

    clearMessage(): void {
        // IE only takes one value to remove at a time.
        this.messageContainer.classList.remove('game-won');
        this.messageContainer.classList.remove('game-over');
        this.messageContainer.classList.remove('restart-game');
    }
}
