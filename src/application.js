import GameManager from './GameManager.js';
import HtmlActuator from './HtmlActuator.js';
import KeyboardInputManager from './KeyboardInputManager.js';
import LocalStorageManager from './LocalStorageManager.js';

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(() => {
    const manager = new GameManager(4, KeyboardInputManager, HtmlActuator, LocalStorageManager);

    manager.begin();
});
