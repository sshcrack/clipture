const plugins = require('./webpack.plugins');


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
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    plugins: [
      ...plugins,
    ]
  },
  externals: {
    "@streamlabs/obs-studio-node": "@streamlabs/obs-studio-node"
  }
};