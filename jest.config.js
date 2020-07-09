const isWatchingMode = process.argv[2] === '--watch';

module.exports = {
    setupFiles: [
        'regenerator-runtime/runtime'
    ],
    verbose: true,
    collectCoverage: !isWatchingMode,
    coverageDirectory: './test/coverage',
    collectCoverageFrom: [
        'packages/**/*.{ts,tsx,js,jsx}',
        '!packages/**/docs/*',
        '!packages/**/*.type.ts',
        '!packages/**/index.{ts,js}',
        '!**/*config.js',
        '!**/*stories.*'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/bin/',
        '/build/',
        '/tmp/',
        '__tests__',
        '/types?/',
        '/.storybook'
    ],
    moduleFileExtensions: ['js', 'ts', 'tsx', 'html'],
    testMatch: ['**/?(*.)(spec|step).(ts|tsx|js|jsx)'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/lib/', '/tmp/'],
    globals: {
        debug: true
    },
    transformIgnorePatterns: [
        'node_modules'
    ],
    transform: {
        '^.+\\.(js|ts|tsx)$': 'babel-jest'
    },
    coverageThreshold: isWatchingMode ? {} : {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100
        }
    }
};
