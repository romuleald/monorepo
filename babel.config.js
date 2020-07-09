module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                debug: false,
                targets: {
                    browsers: ['last 2 versions', 'ie >= 11']
                }
            }
        ],
        ['@babel/preset-typescript'],
        ["@babel/preset-react"]
    ],
    plugins: [
        ['@babel/plugin-transform-react-jsx'],
        [
            '@emotion/babel-plugin-jsx-pragmatic',
            {
                module: 'react',
                import: 'React'
            }
        ],
        ['babel-plugin-ramda', {useES: true}],
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-transform-regenerator',
        '@babel/plugin-proposal-async-generator-functions'
    ]
};
