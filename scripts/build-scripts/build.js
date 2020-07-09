const {removeSync, pathExistsSync, copyFileSync} = require('fs-extra');
const path = require('path');
const {execSync} = require('child_process');
const _chalk = require('chalk');
const chalk = new _chalk.Instance({level: 2});
const colors = require('js-colourfull');

const folderPath = process.cwd();
const {name} = require(path.resolve(folderPath, 'package.json'));

console.log(`${chalk.blue('[INFO]')}`, `Building ${chalk.bgMagenta(chalk.bold.whiteBright(name))} !`);

const rootFolderPath = path.resolve(__dirname, '../../');
const nodeModulesBinPath = path.resolve(rootFolderPath, './node_modules/.bin/');
const typescriptBuildOutDir = path.resolve(folderPath, 'build');
const babelBuildOutDir = path.resolve(folderPath, 'dist');
const jsFolderPath = path.resolve(folderPath, './src/js');
const tsIndexFile = path.resolve(folderPath, './src/index.ts');
const babelRoot = path.resolve(rootFolderPath, './babel.config.js');
const babelPackage = path.resolve(folderPath, './babel.config.js');
const hasSelfBabel = pathExistsSync(babelPackage);
const babelPath = hasSelfBabel ? babelPackage : babelRoot;

try {
    console.log(chalk.blue('[INFO]'), `Removing 🗑 ${chalk.bold('build')} folders`);
    removeSync(typescriptBuildOutDir);
    removeSync(babelBuildOutDir);

    console.info(jsFolderPath, tsIndexFile);
    if (pathExistsSync(jsFolderPath) || pathExistsSync(tsIndexFile)) {
        console.log(chalk.blue('[INFO]'), `Transpiling with ${colors.typeScript}`);
        execSync(`${path.resolve(nodeModulesBinPath, 'tsc')} --project ${path.resolve(folderPath, 'tsconfig.json')}`);

        console.log(chalk.blue('[INFO]'), `Transpiling with ${colors.babel}`);
        execSync(`${path.resolve(nodeModulesBinPath, 'babel')} --config-file ${babelPath} ${typescriptBuildOutDir} --out-dir ${path.resolve(babelBuildOutDir, './js')} --copy-files`);

        console.log(chalk.blue('[INFO]'), `Copying the ${colors.js} index`);
        copyFileSync(path.resolve(__dirname, 'standard-index.js'), path.resolve(folderPath, 'index.js'));
    }

    console.log(`${chalk.green('[SUCCESS]')}`, `Built ${chalk.bgMagenta(chalk.bold.whiteBright(name))} SUCCESSFULLY !!!! 🎉`);
    process.exit(0);
} catch (error) {
    console.log(chalk.red('[ERROR]'), 'ERROR !!! 🙄🤔😤', error.message);
    throw error;
}
