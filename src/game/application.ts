import GameManager from './GameManager.js';
import HtmlActuator from './HtmlActuator.js';
import KeyboardInputManager from './KeyboardInputManager.js';
import LocalStorageManager from './LocalStorageManager.js';
import GameConfig from './GameConfig';

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(() => {
    const config: GameConfig = {
        boardSize: 4,
        startingTiles: 2,
        undoLimit: 5,
        winningValue: 2048,
    };

    const game = new GameManager(
        config,
        new KeyboardInputManager(),
        new HtmlActuator(),
        new LocalStorageManager(),
    );

    game.begin();
});
