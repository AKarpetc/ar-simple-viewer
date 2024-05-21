const path = require('path');
const fs = require('fs');

module.exports =

    (env, argv) => {
        var config = "local";
        if (env.DEV)
            config = "dev"
        if (env.PROD)
            config = "prod"

        fs.copyFile(`./src/config/envs/${config}.js`, './src/config/config.js', (err) => {
            if (err) throw err;
            console.log('config was copied');
        });

        return {
            entry: () => {
                return {
                    arconfigurator: ['./src/arconfigurator/arconfigurator.js'],
                    viewer: ['./src/viewer/render.js'],
                    demo: ['./src/demo/demo.js']
                }
            },
            module: {
                rules: [
                    {
                        test: /\.(js)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    }
                ]
            },
            resolve: {
                extensions: ['*', '.js']
            },
            output: {
                filename: '[name].bandle.js',
                path: path.resolve(__dirname, 'dist'),
            },
        };
    }