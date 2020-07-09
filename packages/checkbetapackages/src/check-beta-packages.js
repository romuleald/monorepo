const path = require('path');
const hasBetaDependencies = deps => Object
    .entries(deps)
    .filter(([, version]) => version.includes('-'));

const doNotFilter = (item, checkbetapackages) => !checkbetapackages.some(packageName => packageName === item[0]);

const checkBeta = ({dependencies = {}, devDependencies = {}, checkbetapackages = []}) => {
    const packagesBeta = hasBetaDependencies({...dependencies, ...devDependencies});

    const filteredPackage = packagesBeta.filter(item => doNotFilter(item, checkbetapackages));
    if (filteredPackage.length) {
        console.log('You should not commit beta version on develop\n', filteredPackage);
        process.exit(1);
    }

    console.log('No beta package detected 👌');
    process.exit(0);
};

checkBeta(require(path.resolve(process.cwd(), './package.json')));
module.exports = checkBeta;
