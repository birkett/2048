const fs = require('fs');
const buildConstants = require('../buildConstants');

const cleanTask = (resolve, reject) => {
    fs.promises.rmdir(buildConstants.outputDirectory, { recursive: true })
        .then(() => {
            fs.promises.mkdir(buildConstants.outputDirectory)
                .then(resolve)
                .catch((mkdirError) => reject(mkdirError));
        })
        .catch((rmdirError) => reject(rmdirError));
};

module.exports = cleanTask;
