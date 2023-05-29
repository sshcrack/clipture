import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { Compiler, Configuration, WebpackPluginInstance } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const shouldAnalyze = process.argv.includes("--analyze")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const plugins: (
  | ((this: Compiler, compiler: Compiler) => void)
  | WebpackPluginInstance
)[] = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
];

if (shouldAnalyze)
  plugins.push(new BundleAnalyzerPlugin({
    analyzerPort: "auto",
  }))

export { plugins };