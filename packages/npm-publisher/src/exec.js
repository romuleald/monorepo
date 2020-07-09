const chalk = require('chalk');
const {exec} = require('child_process');

/**
 * Promisified exec.
 *
 * @param {string} command - Command to execute.
 * @returns {Promise<string>} Output of the command or error message.
 */
const execPromise = command => new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
        if (err) {
            console.error(`${chalk.red('[ERROR]')}`, err.message);
            return reject(stdout);
        }
        return resolve(stdout);
    });
});

module.exports = execPromise;
