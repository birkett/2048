const renderTemplate = require('./build/tasks/renderTemplateTask');
const favIconsTask = require('./build/tasks/favIcons/favIconsTask');
const safariIconTask = require('./build/tasks/favIcons/safariIconTask');
const stylesTask = require('./build/tasks/stylesTask');
const cleanTask = require('./build/tasks/cleanTask');
const build = require('./lib/build/buildSystem');

build({
    default: [
        cleanTask,
        stylesTask,
        renderTemplate.indexTemplate,
        safariIconTask,
        renderTemplate.webManifest,
        renderTemplate.browserConfig,
        favIconsTask,
    ],

    clean: [
        cleanTask,
    ],
});
