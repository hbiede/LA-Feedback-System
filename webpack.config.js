/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/
let webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin()
  ],
  devtool: '',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: 'css-loader',
      },
    ],
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, 'src/components/'),
      redux: path.resolve(__dirname, 'src/redux/'),
      screens: path.resolve(__dirname, 'src/screens/'),
      statics: path.resolve(__dirname, 'src/statics/')
    },
    extensions: [ '.tsx', '.ts', '.js', 'jsx' ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build'),
  },
};
