const fs = require('fs');
const buildConstants = require('../../buildConstants');

const safariIconTask = (resolve, reject) => {
    fs.promises.readFile(buildConstants.faviconInputFile)
        .then((data) => {
            const replaceRegex = new RegExp('fill="#(.*?)"', 'g');

            return data.toString().replace(replaceRegex, 'fill="#000000"');
        })
        .then((outputData) => {
            fs.promises.writeFile(buildConstants.safariIconOutputFileName, outputData)
                .then(resolve)
                .catch((writeFileError) => reject(writeFileError));
        })
        .catch((readFileError) => reject(readFileError));
};

module.exports = safariIconTask;
