const chalk = require('chalk');
const publish = require('./vsts-publish');

const isBeta = process.argv[2] === 'beta';

const displayPublish = ({success, failure}) => {
    success.length && console.log(`${chalk.green('[INFO]')}`, `Publish success :\n${success.map(item => `🚀 ${item}`).join('\n')}`);
    failure.length && console.log(`${chalk.red('[ERROR]')}`, `Publish fail :\n${failure.map(item => `💥 ${item}`).join('\n')}`);
};

(async () => {
    try {
        console.log(`${chalk.green('[INFO]')}`, `Preparing to publish in ${isBeta ? 'beta' : 'production'} version`);
        const {success, failure} = await publish(isBeta);
        displayPublish({success, failure});
    } catch (err) {
        if (err.error) {
            throw new Error(err.message);
        } else {
            console.error(`${chalk.red('[ERROR]')}`, err.message);
        }
    }
})();
