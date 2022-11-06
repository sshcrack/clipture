const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const CopyWebpackPlugin = require("copy-webpack-plugin")
const path = require("path")
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const assets = ["assets"]
const shouldAnalyze = process.argv.includes("--analyze")
module.exports = {
  module: {
    rules: [
      ...rules,
      {
        test: /\.(png|jpe?g|gif|ico)$/,
        type: 'asset/resource'
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
      {
        test: /\.svg$/,
        loader: '@svgr/webpack'
      }
    ],
  },
  plugins: [
    shouldAnalyze && new BundleAnalyzerPlugin({
      analyzerPort: "auto"
    }),
    new CopyWebpackPlugin({
      patterns: assets.map(asset => {
        return {
          from: path.resolve(__dirname, "src", asset, "renderer"),
          to: path.resolve(__dirname, ".webpack/renderer", asset)
        }
      })
    }),
    ...plugins
  ].filter(e => e),
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    plugins: [
      new TsconfigPathsPlugin({})
    ]
  },
  devtool: "source-map",
};
