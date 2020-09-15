const fs = require('fs');
const {
    write,
    writeLine,
    colours,
    controlCodes,
} = require('../logger/consoleWrapper');

let passedExpectations = 0;
let failedExpectations = 0;

const suite = (description, fn) => {
    write(`\n${description}`, controlCodes.bold, colours.blue);

    fn();
};

const describe = (description, fn) => {
    write(`\n\t${description}`, controlCodes.bold, colours.cyan);

    fn();
};

const it = (description, fn) => {
    write(`\n\t\t${description}\n\t\t\t`);

    fn();
};

const xit = () => {
    // Test is disabled.
};

const getFailedExpectation = () => (new Error().stack.split('at ')[3]).trim();

const expect = (value) => ({
    equal: (expected) => {
        if (value === expected) {
            write('√ ', controlCodes.bold, colours.green);
            passedExpectations += 1;

            return;
        }

        failedExpectations += 1;
        write('X \n\n', controlCodes.bold, colours.red);

        writeLine(
            `Expectation failed: ${expected} does not equal ${value}`,
            undefined,
            colours.red,
        );

        writeLine(getFailedExpectation(), undefined, colours.red);
    },
});

const runTests = (directory, files) => {
    const startTime = Date.now();

    files.forEach((file) => {
        if (file.endsWith('Test.js')) {
            const path = directory
                ? `${directory}/${file}`
                : file;

            /* eslint-disable global-require */
            /* eslint-disable import/no-dynamic-require */
            require(fs.realpathSync(path));
            /* eslint-enable import/no-dynamic-require */
            /* eslint-enable global-require */
        }
    });

    const passedText = `\n\nPassed ${passedExpectations},`;
    const failedText = `failed ${failedExpectations} expectations.`;
    const timeText = `Took ${Date.now() - startTime}ms.\n`;

    writeLine(
        `${passedText} ${failedText} ${timeText}`,
        controlCodes.bold,
        failedExpectations > 0 ? colours.red : colours.green,
    );

    process.exit(failedExpectations);
};

const test = () => {
    const argument = process.argv[2];

    if (!argument) {
        const testDirectory = 'test';

        fs.promises.readdir(testDirectory)
            .then((files) => {
                runTests(testDirectory, files);
            });
    }

    if (argument && argument.endsWith('.js')) {
        runTests(undefined, [argument]);
    }
};

module.exports = {
    describe,
    expect,
    it,
    xit,
    suite,
    test,
};
