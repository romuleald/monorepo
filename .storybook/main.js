module.exports = {
    stories: ['../**/*.stories.(js|jsx|ts|tsx)'],
    webpackFinal: async config => {
        config.module.rules.push({
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules\/(?!(ramda)).+\\.(js|ts|tsx)$/,
            use: 'babel-loader'
        });
        config.module.rules.push({
            test: /\.md$/,
            exclude: /node_modules\//,
            use: 'markdown-loader'
        });
        config.resolve.extensions.push('.ts', '.tsx');
        return config;
    }
};
