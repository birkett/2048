const fs = require('fs');
const iconGen = require('icon-gen');
const buildConstants = require('../../buildConstants');

const PNG_MAP = [
    { size: 16, output: `${buildConstants.faviconPrefix}-16x16` },
    { size: 32, output: `${buildConstants.faviconPrefix}-32x32` },
    { size: 60, output: `${buildConstants.appleIconPrefix}-60x60` },
    { size: 70, output: `${buildConstants.msTileIconPrefix}-70x70` },
    { size: 76, output: `${buildConstants.appleIconPrefix}-76x76` },
    { size: 120, output: `${buildConstants.appleIconPrefix}-120x120` },
    { size: 144, output: `${buildConstants.msTileIconPrefix}-144x144` },
    { size: 150, output: `${buildConstants.msTileIconPrefix}-150x150` },
    { size: 152, output: `${buildConstants.appleIconPrefix}-152x152` },
    { size: 180, output: `${buildConstants.appleIconPrefix}-180x180` },
    { size: 192, output: `${buildConstants.androidIconPrefix}-192x192` },
    { size: 310, output: `${buildConstants.msTileIconPrefix}-310x310` },
    { size: 512, output: `${buildConstants.androidIconPrefix}-512x512` },
];

const FILES_TO_COPY = [
    { input: 'apple-touch-icon-180x180', output: buildConstants.appleIconPrefix },
];

const getUniqueSizes = (sizesArray) => {
    const sizes = sizesArray.map((size) => size.size);

    return sizes.filter((value, index) => sizes.indexOf(value) === index);
};

const ICO_SIZES = [16, 24, 32, 48, 64];

const OPTIONS = {
    favicon: {
        name: buildConstants.faviconPrefix,
        sizes: getUniqueSizes(PNG_MAP),
    },
    ico: {
        name: buildConstants.faviconPrefix,
        sizes: ICO_SIZES,
    },
};

const favIconsTask = (resolve, reject) => {
    process.env.OPENSSL_CONF = '';

    const buildFilePath = (path) => `${buildConstants.outputDirectory}${path}.png`;

    iconGen(buildConstants.faviconInputFile, buildConstants.outputDirectory, OPTIONS)
        .then(() => {
            PNG_MAP.forEach((size) => {
                const source = buildFilePath(`${buildConstants.faviconPrefix}${size.size}`);
                const destination = buildFilePath(size.output);

                fs.promises.rename(source, destination)
                    .catch((renameError) => reject(renameError));
            });
        })
        .then(() => {
            FILES_TO_COPY.forEach((toCopy) => {
                fs.promises.copyFile(buildFilePath(toCopy.input), buildFilePath(toCopy.output))
                    .catch((copyError) => reject(copyError));
            });
        })
        .then(resolve);
};

module.exports = favIconsTask;
