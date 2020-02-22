const path = require('path');
const distDir = path.resolve(__dirname, 'dist');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './app/index.ts',
    output: {
        filename: 'bundle.js',
        path: distDir
    },
    devServer: {
        contentBase: distDir,
        port: 60800,
        proxy: {
            "/api": "http://localhost:60702",
            "/es": {
                target: "http://localhost:9200",
                pathRewrite: { "^/es": "" }
            }
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Better Book Bundle Builder' // 在生成的HTML中设置title标签
        }),
        new webpack.ProvidePlugin({ // 使用webpack的插件将jquery模块挂载到全局对象上
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],
    module: {
        rules: [
            {
                /**
                 * 将ts文件转译成js
                 */
                test: /\.ts$/,
                loader: "ts-loader"
            },
            {
                /**
                 * 处理.css文件，css-loader解析css文件，style-loader转换成style标签插入到html中
                 */
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                /**
                 * 处理静态资源，转换成data URI，如果文件超出limit的大小则会使用file-loader直接复制
                 */
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000'
            }
        ]
    }
}