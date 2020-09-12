const fs = require('fs');
const buildConstants = require('../build/buildConstants');
const {
    describe,
    expect,
    it,
    xit,
    suite,
} = require('../lib/test/testSystem');

const VERSION_QUERY_STRING_REGEX = /\?v=(\w{0,7})/g; // ?v=...
const URL_TAG_REGEX = /url\(([^)]+)\)/g; // Selects url(...) tags from CSS.
const XML_SRC_ATTRIBUTE_REGEX = /src="([^"]+)"/g; // Selects src="..." attributes from XML.
const JSON_SRC_PROPERTY_REGEX = /src": "([^"]+)"/g; // Selects src: "..." properties from JSON.

const genericVersionStringTest = (filename, regex) => {
    const fileContent = fs.readFileSync(filename);
    const expectedRevisionHash = buildConstants.gitRevision();
    const matches = fileContent.toString().match(regex);

    expect(matches && matches.length > 0).equal(true);

    // The string should contain the valid git hash.
    matches.forEach((match) => {
        expect(match.includes(`?v=${expectedRevisionHash}`)).equal(true);
    });
};

const versionQueryStringTest = (filename) => {
    genericVersionStringTest(filename, VERSION_QUERY_STRING_REGEX);
};

const urlResourceTest = (filename) => {
    genericVersionStringTest(filename, URL_TAG_REGEX);
};

const xmlSrcAttributeTest = (filename) => {
    genericVersionStringTest(filename, XML_SRC_ATTRIBUTE_REGEX);
};

const jsonSrcPropertyTest = (filename) => {
    genericVersionStringTest(filename, JSON_SRC_PROPERTY_REGEX);
};

suite('Cache breaker query strings', () => {
    describe('CSS', () => {
        xit('Should contain valid cache break query strings on referenced resources', () => {
            versionQueryStringTest(
                `${buildConstants.cssOutputDirectory}${buildConstants.outputCssFileName}`,
            );
        });

        xit('All URL references should contains cache break query strings', () => {
            urlResourceTest(
                `${buildConstants.cssOutputDirectory}${buildConstants.outputCssFileName}`,
            );
        });
    });

    describe('HTML', () => {
        it('Should contain valid cache break query strings on referenced resources', () => {
            versionQueryStringTest(buildConstants.templateOutputFileName);
        });
    });

    describe('Browser Config', () => {
        it('Should contain valid cache break query strings on referenced resources', () => {
            versionQueryStringTest(buildConstants.browserConfigOutputFileName);
        });

        it('All SRC attributes should contain cache break query strings', () => {
            xmlSrcAttributeTest(buildConstants.browserConfigOutputFileName);
        });
    });

    describe('Web Manifest', () => {
        it('Should contain valid cache break query strings on referenced resources', () => {
            versionQueryStringTest(buildConstants.webManifestOutputFileName);
        });

        it('All SRC properties should contain cache break query strings', () => {
            jsonSrcPropertyTest(buildConstants.webManifestOutputFileName);
        });
    });
});
