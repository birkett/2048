const { log } = console;

const controlCodes = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
};

const colours = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

const writeLine = (message, controlCode, fgColour) => {
    log(`${controlCode || ''}${fgColour || ''}${message}${controlCodes.reset}`);
};

const write = (message, controlCode, fgColour) => {
    process.stdout.write(`${controlCode || ''}${fgColour || ''}${message}${controlCodes.reset}`);
};

module.exports = {
    colours,
    controlCodes,
    writeLine,
    write,
};
