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

    constructor() {
        this.events = {};

        this.listen();
    }

    on(event: string, callback: Function): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    }

    emit(event: string, data?: string | number): void {
        const callbacks = this.events[event];

        if (callbacks) {
            callbacks.forEach((callback: Function) => {
                callback(data);
            });
        }
    }

    listen(): void {
        document.addEventListener('keydown', (event) => {
            const modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
            const mapped = MovementKeys[event.code];

            if (modifiers) {
                if (event.code === 'KeyZ' && (event.ctrlKey || event.metaKey)) {
                    this.undo(event);
                }

                return;
            }

            if (mapped !== undefined) {
                event.preventDefault();
                this.emit('move', mapped);

                return;
            }

            if (event.code === 'KeyR') {
                this.restart(event);
            }

            if (event.code === 'KeyQ' || event.code === 'PageUp') {
                event.preventDefault();
                this.emit('rotate', -1);
            }

            if (event.code === 'KeyE' || event.code === 'PageDown') {
                event.preventDefault();
                this.emit('rotate', 1);
            }

            if (event.code === 'KeyV') {
                this.emit('flipX');
            }

            if (event.code === 'KeyH') {
                this.emit('flipY');
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

        gameContainer.addEventListener('touchstart', (event: TouchEventInit) => {
            if (event.touches!.length > 1 || event.targetTouches!.length > 1) {
                return; // Ignore if touching with more than 1 finger
            }

            touchStartClientX = event.touches![0].clientX;
            touchStartClientY = event.touches![0].clientY;

            event.preventDefault();
        });

        gameContainer.addEventListener('touchmove', (event) => {
            event.preventDefault();
        });

        gameContainer.addEventListener('touchend', (event: TouchEventInit) => {
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

                this.emit('move', data);
            }
        });
    }

    restart(event: Event): void {
        event.preventDefault();
        this.emit('restart');
    }

    undo(event: Event): void {
        event.preventDefault();
        this.emit('undo');
    }

    restartWithConfirmation(event: Event): void {
        event.preventDefault();
        this.emit('restartWithConfirmation');
    }

    keepPlaying(event: Event): void {
        event.preventDefault();
        this.emit('keepPlaying');
    }

    bindButtonPress(selector: string, fn: Function): void {
        const button = document.querySelector(selector);

        if (!button) {
            return;
        }

        button.addEventListener('click', fn.bind(this));
        button.addEventListener('touchend', fn.bind(this));
    }
}
