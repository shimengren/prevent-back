const path = require("path");
const entry = path.join(__dirname, "./src/index.js")
module.exports = {
    mode: 'none',
    entry: {
        "index.umd": {
            import: entry,
            library: {
                name: 'PreventBack',
                type: 'umd',
                umdNamedDefine: true,
            },
        },
        "index.common": {
            import: entry,
            library: {
                name: 'PreventBack',
                type: 'commonjs',
            },
        }
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].js",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: "babel-loader",
                exclude: /node_modules/
            }
        ]
    },
};