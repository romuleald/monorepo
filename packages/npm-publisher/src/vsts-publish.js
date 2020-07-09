const chalk = require('chalk');
const path = require('path');
const {publishConfig} = require(path.resolve(process.cwd(), './package.json'));
const exec = require('./exec');
const {getAllPackages, getLastModifiedPackagesJson} = require('./git-diff');
const {getUnpublishedPackages} = require('./npm-utils');
const {series} = require('async-array-methods');

if(!publishConfig || !publishConfig.registry){
    throw new Error('No registry configured in package.json, please see README.md');
}
/**
 * Date.
 *
 * @param {Date} date - Date object.
 * @example getEasyTime(Date.now()); // see @returns
 * @returns {{DD: string, MM: string, YY: string, s: string, h: string, m: string}} - Splitted by letter date.
 */
const getEasyTime = date => {
    const [DD, MM, YY, h, m, s] = Intl.DateTimeFormat('fr-FR', {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    }).format(date)
        .replace(/[\sà:,]/g, '/')
        .split('/')
        .filter(timeItem => timeItem && timeItem);
    return {
        DD, MM, YY, h, m, s
    };
};

/**
 * Get time with a specific incremental compatible format.
 *
 * @param {{DD: string, MM: string, YY: string, s: string, h: string, m: string}} props - From getEasyTime().
 * @returns {string} - Use getTimeVersionFormatted(getEasyTime(Date.now())); // 20154113302.
 */
const getTimeVersionFormatted = ({DD, MM, YY, h, m, s}) => `${YY}${MM}${DD}${h}${m}${s}`;

/**
 * Gives publish package name and beta tags.
 *
 * @returns {{npmDistTag: string, publishedVersion: string, packageName: string}} - Variables.
 */
const getPublishParams = ({name, isBeta, version}) => {
    const timeFormattedVersion = getTimeVersionFormatted(getEasyTime(Date.now()));
    const npmDistTag = isBeta ? ' --tag beta' : '';
    const publishedVersion = isBeta ? `${version.split('-')[0]}-${timeFormattedVersion}` : version;
    const packageName = name.split('/')[1];
    return {npmDistTag, publishedVersion, packageName};
};

/**
 * Change package to prerelease.
 */
const prepareBetaPackage = async ({name, timeFormattedVersion, folder}) => {
    console.log(`${chalk.green('[INFO]')}`, `Mode beta: changing version with npm version prerelease --preid=${timeFormattedVersion}`);
    await exec(`cd ${folder}/${name.split('/')[1]} && npm version prerelease --preid=${timeFormattedVersion}`);
};
/**
 * Publish a package and waits for it to be published.
 *
 * @param {object} pkg - Package object.
 * @param {object} pkg.name - Package's name.
 * @param {object} pkg.version - Package's version.
 * @param {boolean} isBeta - Will publish to be done with --tag beta?
 *
 */
const publishPackage = async ({name, version, folder}, isBeta) => {
    try {
        const timeFormattedVersion = getTimeVersionFormatted(getEasyTime(Date.now()));
        const {npmDistTag, publishedVersion, packageName} = getPublishParams({name, isBeta, version});
        if (isBeta) {
            await prepareBetaPackage({name, timeFormattedVersion, folder});
        }

        console.log(`${chalk.green('[INFO]')}`, `Publishing package ${name}@${publishedVersion}${npmDistTag}`);
        console.log(`${chalk.green('[INFO]')}`, `npm publish ${folder}/${packageName}${npmDistTag} --registry ${publishConfig.registry}\n`);
        await exec(`npm publish ${folder}/${packageName}${npmDistTag} --access public --registry ${publishConfig.registry}`);
    } catch (err) {
        console.log(`${chalk.red('[ERROR]')}`, `Error while publishing for ${name}@${version} : ${err.message}\n`);
        throw err;
    }
};

/**
 * Publish a list of packages synchronously.
 *
 * @param {object[]} pkgList - List of packages to publish.
 * @param {string} pkgList[].name - Package name.
 * @param {string} pkgList[].version - Package version.
 * @param {boolean} isBeta - Will publish to be done with --tag beta?
 * @returns {object} Contains the list of packages successfully published and those which failed.
 */
const publishPackageList = async (pkgList, isBeta) => {
    const result = {
        success: [],
        failure: []
    };
    await series(pkgList, async pkg => {
        const currentPackageName = `${pkg.name}@${pkg.version}`;
        try {
            await publishPackage(pkg, isBeta);
            result.success.push(currentPackageName);
        } catch (err) {
            result.failure.push(currentPackageName);
        }
    });
    return result;
};

/**
 * Execute the publish.
 *
 * @param {boolean} isBeta - Will publish to be done with --tag beta?
 * @returns {object} - Object containing packages published successfully and packages that failed.
 */
const publish = async (isBeta = false) => {
    const pkgList = isBeta ? await getLastModifiedPackagesJson() : getAllPackages();
    const unpublishedPkgs = isBeta ? pkgList : await getUnpublishedPackages(pkgList);
    if (unpublishedPkgs.length === 0) {
        console.log(`${chalk.green('[INFO]')}`, 'No package to publish');
        return {success: [], failure: []};
    }
    const packageList = unpublishedPkgs.map(({name}) => `⚙︎ ${name}`).join('\n');
    console.log(`${chalk.green('[INFO]')}`, `Preparing to publish packages:\n${packageList}\n`);
    return publishPackageList(unpublishedPkgs, isBeta);
};

module.exports = publish;
