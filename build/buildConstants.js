const childProcess = require('child_process');
const memoize = require('../lib/memoize/memoize');

const ASSETS_DIR = './assets/';
const OUTPUT_DIR = './dist/';

const SVG_INPUT_DIR = `${ASSETS_DIR}svg/`;
const JS_INPUT_DIR = `${ASSETS_DIR}js/`;
const COMPONENT_INPUT_DIR = `${ASSETS_DIR}components/`;

const WEB_MANIFEST_OUTPUT_FILE_NAME = 'site.webmanifest';
const SAFARI_ICON_FILE_NAME = 'safari-pinned-tab.svg';

module.exports = {
    siteName: '2048',
    outputDirectory: OUTPUT_DIR,

    scssInputDirectory: `${ASSETS_DIR}scss/`,
    cssOutputDirectory: `${OUTPUT_DIR}css/`,

    jsInputDirectory: JS_INPUT_DIR,
    jsOutputDirectory: `${OUTPUT_DIR}js/`,

    templateInputFileName: `${COMPONENT_INPUT_DIR}index.html.njk`,
    templateOutputFileName: `${OUTPUT_DIR}index.html`,

    webManifestInputFileName: `${COMPONENT_INPUT_DIR}webManifest.json.njk`,
    webManifestFileName: WEB_MANIFEST_OUTPUT_FILE_NAME,
    webManifestOutputFileName: `${OUTPUT_DIR}${WEB_MANIFEST_OUTPUT_FILE_NAME}`,

    browserConfigInputFileName: `${COMPONENT_INPUT_DIR}browserConfig.xml.njk`,
    browserConfigOutputFileName: `${OUTPUT_DIR}browserconfig.xml`,

    faviconInputFile: `${SVG_INPUT_DIR}2048.svg`,
    safariIconFileName: SAFARI_ICON_FILE_NAME,
    safariIconOutputFileName: `${OUTPUT_DIR}${SAFARI_ICON_FILE_NAME}`,

    outputCssFileName: 'main.css',

    faviconPrefix: 'favicon',
    appleIconPrefix: 'apple-touch-icon',
    androidIconPrefix: 'android-chrome',
    msTileIconPrefix: 'mstile',

    themeColor: '#000000',
    msTileColor: '#2B5797',

    gitRevision: memoize(() => {
        const stdOut = childProcess.execSync('git rev-parse --short HEAD');

        return stdOut.toString().split('\n').join('');
    }),
};
