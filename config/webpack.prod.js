const path = require("path");
const { merge } = require("webpack-merge");
const baseConfig = require("./webpack.base");
const webpack = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const os = require("os");
const TerserPlugin = require("terser-webpack-plugin"); //
const CompressionPlugin = require("compression-webpack-plugin"); // gzip
const threads = os.cpus().length;

module.exports = merge(baseConfig, {
    mode: "production",
    optimization: {
        minimize: true, //
        concatenateModules: true, //
        splitChunks: {
            chunks: "all",
            minSize: 10000, // chunk (10KB
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                    name: "vendors", //
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
                roles: {
                    test: /[\/]src[\/]models[\/]roles[\/]/,
                    name: "roles",
                    priority: -15,
                    reuseExistingChunk: true
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                parallel: threads, //
                terserOptions: {
                    compress: {
                        drop_console: true, // console
                        drop_debugger: true, // debugger
                        pure_funcs: ["console.log", "test"], //
                        dead_code: true, //
                        unused: true, //
                    },
                    format: {
                        comments: false, //
                    }
                },
                extractComments: false, //
            })
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            //
            "process.env": JSON.stringify(process.env)
        }),
        new CompressionPlugin({
            algorithm: "gzip",
            test: /\.(js|css|html|svg)$/,
            threshold: 8192, // 8kb
            minRatio: 0.8, // 0.8
        }),
        new webpack.ids.HashedModuleIdsPlugin(), // ID
    ]
});