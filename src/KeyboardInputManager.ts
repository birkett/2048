interface EventsList {
    [index: string]: Function[];
}

interface MappedKeyList {
    [index: string]: string;
}

interface TouchEventInit extends EventModifierInit {
    changedTouches?: Touch[];
    targetTouches?: Touch[];
    touches?: Touch[];
    preventDefault: Function;
}

const MovementKeys: MappedKeyList = {
    ArrowUp: 'Up',
    ArrowRight: 'Right',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    KeyW: 'Up',
    KeyD: 'Right',
    KeyS: 'Down',
    KeyA: 'Left',
};

export default class KeyboardInputManager {
    events: EventsList;
    eventTouchstart: string;
    eventTouchmove: string;
    eventTouchend: string;

    constructor() {
        this.events = {};

        this.eventTouchstart = 'touchstart';
        this.eventTouchmove = 'touchmove';
        this.eventTouchend = 'touchend';

        this.listen();
    }

    on(event: string, callback: Function) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    }

    emit(event: string, data?: string | number) {
        const callbacks = this.events[event];

        if (callbacks) {
            callbacks.forEach((callback: Function) => {
                callback(data);
            });
        }
    }

    listen() {
        const self = this;

        document.addEventListener('keydown', (event) => {
            const modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
            const mapped = MovementKeys[event.code];

            if (modifiers) {
                if (event.code === 'KeyZ' && (event.ctrlKey || event.metaKey)) {
                    self.undo.call(self, event);
                }

                return;
            }

            if (mapped !== undefined) {
                event.preventDefault();
                self.emit('move', mapped);

                return;
            }

            if (event.code === 'KeyR') {
                self.restart.call(self, event);
            }

            if (event.code === 'KeyQ' || event.code === 'PageUp') {
                event.preventDefault();
                self.emit('rotate', -1);
            }

            if (event.code === 'KeyE' || event.code === 'PageDown') {
                event.preventDefault();
                self.emit('rotate', 1);
            }

            if (event.code === 'KeyV') {
                self.emit('flipX');
            }

            if (event.code === 'KeyH') {
                self.emit('flipY');
            }
        });

        // Respond to button presses
        this.bindButtonPress('.retry-button', this.restart);
        this.bindButtonPress('.keep-playing-button', this.keepPlaying);
        this.bindButtonPress('.restart-button', this.restartWithConfirmation);
        this.bindButtonPress('.confirm-button', this.restart);
        this.bindButtonPress('.cancel-button', this.keepPlaying);

        // Respond to swipe events
        let touchStartClientX: number;
        let touchStartClientY: number;
        const gameContainer = document.getElementsByClassName('game-container')[0];

        gameContainer.addEventListener(this.eventTouchstart, (event: TouchEventInit) => {
            if (event.touches!.length > 1 || event.targetTouches!.length > 1) {
                return; // Ignore if touching with more than 1 finger
            }

            touchStartClientX = event.touches![0].clientX;
            touchStartClientY = event.touches![0].clientY;

            event.preventDefault();
        });

        gameContainer.addEventListener(this.eventTouchmove, (event) => {
            event.preventDefault();
        });

        gameContainer.addEventListener(this.eventTouchend, (event: TouchEventInit) => {
            if (event.touches!.length > 0 || event.targetTouches!.length > 0) {
                return; // Ignore if still touching with one or more fingers
            }

            const touchEndClientX = event.changedTouches![0].clientX;
            const touchEndClientY = event.changedTouches![0].clientY;

            const dx = touchEndClientX - touchStartClientX;
            const absDx = Math.abs(dx);

            const dy = touchEndClientY - touchStartClientY;
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) > 10) {
                const rightLeft = (dx > 0 ? 'Right' : 'Left');
                const upDown = (dy > 0 ? 'Down' : 'Up');
                const data = absDx > absDy
                    ? rightLeft
                    : upDown;

                self.emit('move', data);
            }
        });
    }

    restart(event: Event) {
        event.preventDefault();
        this.emit('restart');
    }

    undo(event: Event) {
        event.preventDefault();
        this.emit('undo');
    }

    restartWithConfirmation(event: Event) {
        event.preventDefault();
        this.emit('restartWithConfirmation');
    }

    keepPlaying(event: Event) {
        event.preventDefault();
        this.emit('keepPlaying');
    }

    bindButtonPress(selector: string, fn: Function) {
        const button = document.querySelector(selector);

        if (!button) {
            return;
        }

        button.addEventListener('click', fn.bind(this));
        button.addEventListener(this.eventTouchend, fn.bind(this));
    }
}
