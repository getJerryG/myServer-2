const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base");
const webpack = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = merge(baseConfig, {
    mode: "development",
    optimization: {
        splitChunks: {
            // 
            chunks: "all", // chunk
            name: false
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            // 
            "process.env": JSON.stringify(process.env)
        })
    ]
});
