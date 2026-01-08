const path = require("path");
const dotenv = require("dotenv");
const os = require("os");
const nodeExternals = require("webpack-node-externals");

dotenv.config();
const threads = os.cpus().length;

module.exports = {
    target: "node",
    entry: "./src/index.ts",
    output: {
        filename: "bundle.js",
        assetModuleFilename: "images/[name][ext]",
        chunkFilename: "static/js/[name].chunk.js",
        path: path.resolve(__dirname, "../dist"),
        clean: true
    },
    resolve: {
        extensions: [".ts", ".js", ".json", ".d.ts"],
        alias: {
            "@": path.resolve(__dirname, "../src"),
            "~": path.resolve(__dirname, "../types"),
            models: path.resolve(__dirname, "../src/models")
        },
        modules: [path.resolve(__dirname, "../node_modules")],
        fallback: {
            crypto: false,
            zlib: false,
            querystring: false,
            stream: false,
            path: false,
            os: false,
            http: false,
            buffer: false,
            vm: false,
            assert: false,
            util: false,
            async_hooks: false,
            fs: false,
            net: false
        }
    },
    module: {
        rules: [
            {
                oneOf: [
                    {
                        test: /\.(ts|tsx)$/,
                        use: [
                            {
                                loader: "thread-loader",
                                options: {
                                    workers: threads,
                                    workerParallelJobs: 50
                                }
                            },
                            "swc-loader"
                        ],
                        exclude: /node_modules/
                    },
                    {
                        test: /\.(png|svg|jpe?g|gif|webp)$/i,
                        use: [
                            {
                                loader: "file-loader",
                                options: {
                                    name: "[name].[hash:8].[ext]",
                                    outputPath: "images",
                                    publicPath: "/images"
                                }
                            },
                            {
                                loader: "image-webpack-loader",
                                options: {
                                    mozjpeg: { quality: 65 },
                                    optipng: { enabled: false },
                                    pngquant: { quality: [0.65, 0.9], speed: 4 },
                                    gifsicle: { interlaced: false },
                                    webp: { quality: 75 },
                                    avif: { quality: 80 }
                                }
                            }
                        ]
                    },
                    {
                        test: /\.mp4$/,
                        use: [
                            {
                                loader: "file-loader",
                                options: {
                                    name: "[name].[ext]",
                                    outputPath: "videos/"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    cache: {
        type: "filesystem",
        buildDependencies: {
            config: [__filename]
        },
        cacheDirectory: path.resolve(__dirname, "../node_modules/.cache/webpack"),
        allowCollectingMemory: true
    },
    optimization: {
        splitChunks: {
            chunks: "all",
            name: false
        }
    },
    stats: {
        errorDetails: true
    },
    externals: [nodeExternals()],
    ignoreWarnings: [
        {
            module: /node_modules\/express\/lib\/view.js/,
            message: /Critical dependency: the request of a dependency is an expression/
        }
    ]
};