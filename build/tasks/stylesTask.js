const fs = require('fs');
const sass = require('sass');
const util = require('util');
const buildConstants = require('../buildConstants');

const stylesTask = (resolve, reject) => {
    fs.promises.readFile(`${buildConstants.scssInputDirectory}main.scss`)
        .then((scss) => {
            const sassOptions = {
                outputStyle: 'compressed',
                includePaths: [buildConstants.scssInputDirectory],
                data: `$gitRevision: '${buildConstants.gitRevision()}'; ${scss}`,
            };

            return util.promisify(sass.render)(sassOptions);
        })
        .then((renderResult) => {
            fs.promises.mkdir(buildConstants.cssOutputDirectory).catch(() => {});

            return renderResult.css.toString();
        })
        .then((css) => {
            fs.promises.writeFile(`${buildConstants.cssOutputDirectory}main.css`, css)
                .then(resolve)
                .catch((writeFileError) => reject(writeFileError));
        })
        .catch((readFileError) => reject(readFileError));
};

module.exports = stylesTask;
