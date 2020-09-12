const fs = require('fs');
const nunjucks = require('nunjucks');
const util = require('util');
const buildConstants = require('../buildConstants');

const basicRenderTask = (resolve, reject, source, destination) => {
    const data = {
        constants: buildConstants,
    };

    util.promisify(nunjucks.render)(source, data)
        .then((renderedTemplate) => {
            fs.promises.writeFile(destination, renderedTemplate)
                .then(resolve)
                .catch((writeFileError) => reject(writeFileError));
        })
        .catch((renderFileError) => reject(renderFileError));
};

module.exports = {
    browserConfig: (resolve, reject) => {
        basicRenderTask(
            resolve,
            reject,
            buildConstants.browserConfigInputFileName,
            buildConstants.browserConfigOutputFileName,
        );
    },

    indexTemplate: (resolve, reject) => {
        basicRenderTask(
            resolve,
            reject,
            buildConstants.templateInputFileName,
            buildConstants.templateOutputFileName,
        );
    },

    webManifest: (resolve, reject) => {
        basicRenderTask(
            resolve,
            reject,
            buildConstants.webManifestInputFileName,
            buildConstants.webManifestOutputFileName,
        );
    },
};
