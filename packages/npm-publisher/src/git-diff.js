const chalk = require('chalk');
const exec = require('./exec');
const path = require('path');
const glob = require('glob');

/**
 * Get folder packages.
 *
 * @returns {string[]} - Folder packages.
 */
const getFolderPackages = () => {
    const rootPackagePath = path.resolve(process.cwd(), './package.json');
    const {folderPackages} = require(rootPackagePath);
    if (!folderPackages) {
        throw new Error(`Missing folderPackages in ${rootPackagePath}`);
    }
    return folderPackages;
};

const gitDiffCommand = process.platform === 'win32' ?
    'git rev-parse --abbrev-ref HEAD | xargs git diff-tree --no-commit-id -r origin/master --name-status'
    : 'git diff-tree --no-commit-id -r origin/master $(git rev-parse --abbrev-ref HEAD) --name-status';
const gitDiffStagedCommand = 'git diff --name-status --cached';

const addFolderToPackage = ({pkg, packagePath}) => {
    const splittedPath = packagePath.split(path.sep);
    const folderIndex = splittedPath.length - 3;
    return {...pkg, folder: splittedPath[folderIndex]};
};

const getPackageContentWithFolder = packagePath => {
    const file = require(`${packagePath}`);
    return addFolderToPackage({packagePath, pkg: file});
};

/**
 * Split diff line into array.
 *
 * @param {string} item - GIT diff line.
 * @returns {string[]} - Splitted diff line.
 */
const splitDiffLine = item => item.trim().split('\t');

/**
 * Check if the file has been deleted by Git.
 *
 * @param {string} fileChanged - GIT diff first part.
 * @returns {boolean} Match the D for deleted file.
 */
const isFileDeleted = fileChanged => fileChanged.substr(-1) === 'D';

/**
 * Check if the current path is a package.json.
 *
 * @param {string} filePath - File path.
 * @returns {boolean} If package.json is in the file path.
 */
const isPackageFile = filePath => filePath && filePath.match(/package\.json/) && filePath.split(path.sep).length > 1;

/**
 * Find all packages.json of components.
 *
 * @returns {object[]} Packages `JSON objects.
 */
const getAllPackages = () => glob
    .sync(`${path.resolve(process.cwd())}/@(${getFolderPackages().join('|')})/*/package.json`)
    .map(getPackageContentWithFolder);

/**
 * Get last modified package from a git diff.
 *
 * @returns {Promise<object[]>} Packages JSON objects.
 */
const getLastModifiedPackagesJson = async () => {
    try {
        const stdout = await Promise.all([exec(gitDiffCommand), exec(gitDiffStagedCommand)]);
        const packages = [...new Set(stdout.join('\n').split('\n')
            .filter(item => {
                const [fileChanged, filePath] = splitDiffLine(item);

                return isPackageFile(filePath) && !isFileDeleted(fileChanged);
            }))];
        return packages
            .map(pkg => pkg.split('\t')[1])
            .map(packagePath => getPackageContentWithFolder(`${path.resolve(process.cwd())}/${packagePath}`));
    } catch (err) {
        console.error(`${chalk.red('[ERROR]')}`, err);
        throw err;
    }
};

/**
 * Find all modified but deleted components.
 *
 * @returns {Promise<string[]>} List of modified components names.
 */
const getLastModifiedComponentsName = async () => {
    try {
        const stdout = await Promise.all([exec(gitDiffCommand), exec(gitDiffStagedCommand)]);
        const components = stdout
            .join('\n')
            .split('\n')
            .map(item => {
                const [modificationType, filePath] = splitDiffLine(item);
                return modificationType !== 'D' && filePath;
            })
            .filter(filePath => new RegExp(getFolderPackages().join('|')).test(filePath) && !/tools/.test(filePath))
            .map(packageItemsPath => {
                console.info(packageItemsPath);
                const [module, packagePath] = packageItemsPath.split(path.sep);
                try {
                    const {name} = require(path.resolve(process.cwd(), `./${module}/${packagePath}/package.json`));
                    return name;
                } catch (e) {
                    return false;
                }
            })
            .filter(Boolean);
        return [...new Set(components)];
    } catch (err) {
        console.trace(`${chalk.red('[ERROR]')}`, err.message);
        throw err;
    }
};

/**
 * Find all deleted components.
 *
 * @returns {Promise<string[]>} List of deleted components names.
 */
const getDeletedComponents = async () => {
    try {
        const stdout = await Promise.all([exec(gitDiffCommand), exec(gitDiffStagedCommand)]);
        const packages = [...new Set(stdout.join('\n').split('\n')
            .filter(item => {
                const [fileChanged, filePath] = splitDiffLine(item);

                return isPackageFile(filePath) && isFileDeleted(fileChanged);
            }))];
        return packages
            .map(pkg => pkg.split('\t')[1])
            .map(deletedPackage => `@axaclient-socle-front/${deletedPackage.split(path.sep)[1]}`);
    } catch (err) {
        console.error(`${chalk.red('[ERROR]')}`, err.message);
        throw err;
    }
};

module.exports = {getDeletedComponents, getLastModifiedPackagesJson, getLastModifiedComponentsName, getAllPackages};
