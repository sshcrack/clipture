const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin")
const path = require("path")

const assets = [ "assets" ]
module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new TsconfigPathsPlugin({}),
  new CopyWebpackPlugin({
    patterns: assets.map(asset => {
        return {
          from: path.resolve(__dirname, "src", asset),
          to: path.resolve(__dirname, ".webpack/renderer", asset)
        }
      })
  })
];
