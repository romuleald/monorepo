const chalk = require('chalk');
const {getUnpublishedPackages} = require('./npm-utils');
const {getDeletedComponents, getLastModifiedPackagesJson, getLastModifiedComponentsName} = require('./git-diff');

/**
 * Get package's name.
 *
 * @param {object} obj - Package object.
 * @param {string} obj.name - Package's name.
 * @returns {string} Package's name.
 */
const getName = obj => obj.name;

/**
 * Checks that all modified packages will have their version upgraded.
 *
 * @param {string[]} modifiedComponents - Components' name which files were modified.
 * @param {string[]} modifiedPkgs - Components name which package.json was modified.
 * @param {string[]} deletepPkgs - Components name which package.json was modified.
 */
const checkComponentsUpgrade = (modifiedComponents, modifiedPkgs, deletepPkgs) => {
    const notUpgradedComponents = modifiedComponents.filter(name => !modifiedPkgs.includes(name) && !deletepPkgs.includes(name));
    if (notUpgradedComponents.length > 0) {
        throw new Error(
            `Some packages are modified but did not change version : ${notUpgradedComponents.join(' ')}`
        );
    }
};

/**
 * Checks that all modified packages are not yet published with the upgraded version.
 *
 * @param {string[]} unpublishedPkgs - Components' name which are not published.
 * @param {string[]} modifiedPkgs - Components' name which package.json was modified.
 */
const checkPublishedPackages = (unpublishedPkgs, modifiedPkgs) => {
    const alreadyPublishedPkgs = modifiedPkgs.filter(name => !unpublishedPkgs.includes(name));
    if (alreadyPublishedPkgs.length > 0) {
        throw new Error(
            `Some packages are modified but already published : ${alreadyPublishedPkgs.join(' ')}`
        );
    }
};

const getPackageToCheck = async modifiedPkgs => {
    const unpublishedPkgs = await getUnpublishedPackages(modifiedPkgs);
    const modifiedComponents = await getLastModifiedComponentsName();
    const deletedComponents = await getDeletedComponents();
    return {unpublishedPkgs, modifiedComponents, deletedComponents};
};

/**
 * Execute checks on packages version to upgrade.
 */
const executeAllNpmChecks = async () => {
    try {
        const modifiedPkgs = (await getLastModifiedPackagesJson()).map(getName);
        // Unpublished = not published, of any version
        const {unpublishedPkgs, modifiedComponents, deletedComponents} = await getPackageToCheck(modifiedPkgs);

        checkComponentsUpgrade(modifiedComponents, modifiedPkgs, deletedComponents);
        checkPublishedPackages(unpublishedPkgs, modifiedPkgs);
        console.log(`${chalk.green('[LOG]')}`, unpublishedPkgs.length > 0
            ? `You will publish : ${unpublishedPkgs.join(' ')}`
            : 'You won\'t publish any package');
        process.exit(0);
    } catch (err) {
        console.log(`${chalk.red('[ERROR]')}`, err.message);
        process.exit(1);
    }
};

executeAllNpmChecks();
