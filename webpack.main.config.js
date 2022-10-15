const plugins = require('./webpack.plugins');
const CopyWebpackPlugin = require("copy-webpack-plugin")
const path = require("path")
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


const assets = ["assets"]
const shouldAnalyze = process.argv.includes("--analyze")
module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  node: {
    __dirname: false,
  },
  plugins: [
    shouldAnalyze && new BundleAnalyzerPlugin({
      analyzerPort: "auto"
    }),
    new webpack.DefinePlugin({
      'process.env.FLUENTFFMPEG_COV': false
    }),
    new CopyWebpackPlugin({
      patterns: [
        ...assets.map(asset => {
          return {
            from: path.resolve(__dirname, "src", asset, "main"),
            to: path.resolve(__dirname, ".webpack/main", asset)
          }
        })
      ]
    }),
    ...plugins
  ].filter(e => e),
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    plugins: [
      new TsconfigPathsPlugin({})
    ]
  },
  devtool: "source-map",
  externals: {
    "@streamlabs/obs-studio-node": "@streamlabs/obs-studio-node"
  }
};

