import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import CopyWebpackPlugin from "copy-webpack-plugin"
import path from "path"
import { TsconfigPathsPlugin} from 'tsconfig-paths-webpack-plugin';
import { Configuration } from 'webpack';

const assets = ["assets"]
export const rendererConfig: Configuration = {
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
