const fs = require('fs');
const buildConstants = require('../build/buildConstants');
const {
    describe,
    expect,
    it,
    xit,
    suite,
} = require('../lib/test/testSystem');

const testFilesPresent = (folder, extension, expectedTotal, expectedMatches) => {
    const dirEntries = fs.readdirSync(folder, { withFileTypes: true });

    const allFiles = dirEntries.filter((entry) => entry.isFile());

    expect(allFiles.length).equal(expectedTotal);

    const matches = allFiles.filter((file) => file.name.endsWith(extension));

    expect(matches.length).equal(expectedMatches);
};

suite('Count files in the dist folder', () => {
    describe('CSS', () => {
        it('Should have 1 compiled style sheet', () => {
            testFilesPresent(buildConstants.cssOutputDirectory, '.css', 1, 1);
        });
    });

    describe('Favicons', () => {
        it('Should have 13 PNG favicons', () => {
            testFilesPresent(buildConstants.outputDirectory, '.png', 19, 14);
        });

        it('Should have 1 SVG favicon', () => {
            testFilesPresent(buildConstants.outputDirectory, '.svg', 19, 1);
        });

        it('Should have 1 ICO favicon', () => {
            testFilesPresent(buildConstants.outputDirectory, '.ico', 19, 1);
        });
    });
});
