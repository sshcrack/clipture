const plugins = require('./webpack.plugins');
const CopyWebpackPlugin = require("copy-webpack-plugin")
const path = require("path")
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');


const assets = ["assets"]
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
  plugins: [
    new CopyWebpackPlugin({
      patterns: assets.map(asset => {
        return {
          from: path.resolve(__dirname, "src", asset, "main"),
          to: path.resolve(__dirname, ".webpack/main", asset)
        }
      })
    }),
    ...plugins
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    plugins: [
      new TsconfigPathsPlugin({})
    ]
  },
  externals: {
    "@streamlabs/obs-studio-node": "@streamlabs/obs-studio-node"
  }
};