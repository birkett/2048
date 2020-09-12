const clearContainer = (container) => {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

const applyClasses = (element, classes) => {
    element.setAttribute('class', classes.join(' '));
};

const normalizePosition = (position) => ({ x: position.x + 1, y: position.y + 1 });

const positionClass = (position) => {
    position = normalizePosition(position);

    return `tile-position-${position.x}-${position.y}`;
};

export default class HtmlActuator {
    constructor() {
        this.tileContainer = document.querySelector('.tile-container');
        this.movesContainer = document.querySelector('.moves-container');
        this.scoreContainer = document.querySelector('.score-container');
        this.bestContainer = document.querySelector('.best-container');
        this.messageContainer = document.querySelector('.game-message');
        this.gridContainer = document.querySelector('.grid-container');

        this.score = 0;
    }

    buildHTMLGrid(size) {
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

    actuate(grid, metadata) {
        const self = this;

        window.requestAnimationFrame(() => {
            clearContainer(self.tileContainer);

            grid.cells.forEach((column) => {
                column.forEach((cell) => {
                    if (cell) {
                        self.addTile(cell);
                    }
                });
            });

            self.updateMoves(metadata.moves);
            self.updateScore(metadata.score);
            self.updateBestScore(metadata.bestScore);

            if (metadata.terminated) {
                if (metadata.won) {
                    self.message(true); // You win!
                } else if (metadata.over) {
                    self.message(false); // You lose
                }
            }
        });
    }

    continueGame() {
        this.clearMessage();
    }

    addTile(tile) {
        const self = this;

        const wrapper = document.createElement('div');
        const inner = document.createElement('div');
        const position = tile.previousPosition || { x: tile.x, y: tile.y };
        const positionClassString = positionClass(position);

        // We can't use classlist because it somehow glitches when replacing classes
        const classes = ['tile', `tile-${tile.value}`, positionClassString];

        if (tile.value > 2048) classes.push('tile-super');

        applyClasses(wrapper, classes);

        inner.classList.add('tile-inner');
        inner.textContent = tile.value;

        if (tile.previousPosition) {
            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(() => {
                classes[2] = positionClass({ x: tile.x, y: tile.y });
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

    updateMoves(moves) {
        this.movesContainer.textContent = moves;
    }

    updateScore(score) {
        clearContainer(this.scoreContainer);

        const difference = score - this.score;
        this.score = score;

        this.scoreContainer.textContent = this.score;

        if (difference > 0) {
            const addition = document.createElement('div');
            addition.classList.add('score-addition');
            addition.textContent = `+${difference}`;

            this.scoreContainer.appendChild(addition);
        }
    }

    updateBestScore(bestScore) {
        this.bestContainer.textContent = bestScore;
    }

    message(won) {
        const type = won ? 'game-won' : 'game-over';
        const message = won ? 'You win!' : 'Game over!';

        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName('p')[0].textContent = message;
    }

    promptRestart() {
        const message = 'Start a new game?';

        this.messageContainer.classList.add('restart-game');
        this.messageContainer.getElementsByTagName('p')[0].textContent = message;
    }

    clearMessage() {
        // IE only takes one value to remove at a time.
        this.messageContainer.classList.remove('game-won');
        this.messageContainer.classList.remove('game-over');
        this.messageContainer.classList.remove('restart-game');
    }
}
