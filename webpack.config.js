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
            console.log('source.txt was copied to destination.txt');
        });

        return {
            entry: () => {
                return {
                    arconfigurator: ['./src/arconfigurator/arconfigurator.js'],
                    viewer: ['./src/viewer/render.js'],
                    index: ['./src/index/index.js'],
                    callBack: ['./src/loginCalback.js'],
                    auth: ['./src/common/auth.js'],
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