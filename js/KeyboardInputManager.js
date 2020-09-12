export default class KeyboardInputManager {
    constructor() {
        this.events = {};

        this.eventTouchstart = 'touchstart';
        this.eventTouchmove = 'touchmove';
        this.eventTouchend = 'touchend';

        this.listen();
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    }

    emit(event, data) {
        const callbacks = this.events[event];

        if (callbacks) {
            callbacks.forEach((callback) => {
                callback(data);
            });
        }
    }

    listen() {
        const self = this;

        const map = {
            'ArrowUp': 0,
            'ArrowRight': 1,
            'ArrowDown': 2,
            'ArrowLeft': 3,
            'KeyW': 0,
            'KeyD': 1,
            'KeyS': 2,
            'KeyA': 3,
        };

        // Respond to direction keys
        document.addEventListener('keydown', (event) => {
            const modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
            const mapped = map[event.code];

            if (!modifiers) {
                if (mapped !== undefined) {
                    event.preventDefault();
                    self.emit('move', mapped);
                }
            }

            // R key restarts the game
            if (!modifiers && event.code === 'KeyR') {
                self.restart.call(self, event);
            }
        });

        // Respond to button presses
        this.bindButtonPress('.retry-button', this.restart);
        this.bindButtonPress('.restart-button', this.restart);
        this.bindButtonPress('.keep-playing-button', this.keepPlaying);

        // Respond to swipe events
        let touchStartClientX;
        let touchStartClientY;
        const gameContainer = document.getElementsByClassName('game-container')[0];

        gameContainer.addEventListener(this.eventTouchstart, (event) => {
            if ((!window.navigator.msPointerEnabled && event.touches.length > 1)
                || event.targetTouches.length > 1) {
                return; // Ignore if touching with more than 1 finger
            }

            if (window.navigator.msPointerEnabled) {
                touchStartClientX = event.pageX;
                touchStartClientY = event.pageY;
            } else {
                touchStartClientX = event.touches[0].clientX;
                touchStartClientY = event.touches[0].clientY;
            }

            event.preventDefault();
        });

        gameContainer.addEventListener(this.eventTouchmove, (event) => {
            event.preventDefault();
        });

        gameContainer.addEventListener(this.eventTouchend, (event) => {
            if ((!window.navigator.msPointerEnabled && event.touches.length > 0)
                || event.targetTouches.length > 0) {
                return; // Ignore if still touching with one or more fingers
            }

            let touchEndClientX; let
                touchEndClientY;

            if (window.navigator.msPointerEnabled) {
                touchEndClientX = event.pageX;
                touchEndClientY = event.pageY;
            } else {
                touchEndClientX = event.changedTouches[0].clientX;
                touchEndClientY = event.changedTouches[0].clientY;
            }

            const dx = touchEndClientX - touchStartClientX;
            const absDx = Math.abs(dx);

            const dy = touchEndClientY - touchStartClientY;
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) > 10) {
                // (right : left) : (down : up)
                self.emit('move', absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
            }
        });
    }

    restart(event) {
        event.preventDefault();
        this.emit('restart');
    }

    keepPlaying(event) {
        event.preventDefault();
        this.emit('keepPlaying');
    }

    bindButtonPress(selector, fn) {
        const button = document.querySelector(selector);
        button.addEventListener('click', fn.bind(this));
        button.addEventListener(this.eventTouchend, fn.bind(this));
    }
}
