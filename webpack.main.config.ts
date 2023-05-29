import { plugins } from './webpack.plugins'
import CopyWebpackPlugin from "copy-webpack-plugin"
import path from "path"
import webpack, { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';


const assets = ["assets"]

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  node: {
    __dirname: false,
  },
  plugins: [
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
        }),
        {
          from: path.resolve(__dirname, "node_modules", "@streamlabs", "game_overlay", "npm"),
          to: path.resolve(__dirname, ".webpack/main")
        },
        {
          from: path.resolve(__dirname, "node_modules", "node-global-key-listener", "bin"),
          to: path.resolve(__dirname, ".webpack/main/key-listener")
        }
      ]
    }),
    ...plugins
  ],
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

