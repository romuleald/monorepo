const chalk = require('chalk');
const exec = require('./exec');

/**
 * Checks if a package is published.
 *
 * @param {object} pkg - Package.json object.
 * @param {string} pkg.name - Package name.
 * @param {string} pkg.version - Package version.
 * @returns {Promise<boolean>} - If the package is published.
 */
const isPublished = async ({name, version}) => {
    try {
        const stdout = await exec(`npm view ${name}@${version} --json`);
        return stdout.length > 0;
    } catch (err) {
        const {error: {code, summary, detail}} = JSON.parse(err);
        // First publish of the package
        if (code === 'E404') {
            return false;
        }
        console.error(`${chalk.red('[ERROR]')}`, summary);
        console.error(`${chalk.red('[ERROR]')}`, detail);
        throw err;
    }
};

/**
 * List package.json that are not already published.
 *
 * @param {object[]} pkgList - List of package.json objects.
 * @returns {Promise<object[]>} List of package.json not already published.
 */
const getUnpublishedPackages = pkgList =>
    Promise.all(pkgList.map(isPublished)).then(isPublishedState =>
        pkgList.filter((_, index) => !isPublishedState[index])
    );

module.exports = {getUnpublishedPackages, isPublished};
