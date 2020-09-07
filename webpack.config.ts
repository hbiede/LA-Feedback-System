/*------------------------------------------------------------------------------
 - Copyright (c) 2020.
 -
 - File created by Hundter Biede for the UNL CSE Learning Assistant Program
 -----------------------------------------------------------------------------*/
import webpack from 'webpack';
import path from 'path';

const config: webpack.Configuration = {
  entry: './src/index.tsx',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
  ],
  devtool: false,
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
      statics: path.resolve(__dirname, 'src/statics/'),
    },
    extensions: ['.tsx', '.ts', '.js', 'jsx'],
  },
  output: {
    filename: 'feedback.js',
    path: path.resolve(__dirname, 'build'),
  },
};

export default config;
