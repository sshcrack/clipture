const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');


module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    plugins: [
      ...plugins,
      {
        test: /\.(png|jpe?g|gif|ico|svg)$/,
        type: 'asset/resource'
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      }
    ]
  },
};
