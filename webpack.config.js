const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const path = require('path');
const dist = path.resolve(__dirname, 'dist')
const generate = require('generate-file-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  //devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9010,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: '/node_modules/',
        use: [{
          loader: 'ts-loader',
          options: {
            // // IMPORTANT! use happyPackMode mode to speed-up compilation and reduce errors reported to webpack
            // happyPackMode: true
            onlyCompileBundledFiles: true,
            transpileOnly: true,
            experimentalWatchApi: true,
          }
        }],

      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    pathinfo: false,
    filename: '[hash]bundle.js',
    path: dist,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: dist + '/assets' },
        { from: 'static', to: dist + '/' },
      ],
    }),
    new ZipPlugin({
      path: 'zip',
      filename: 'myapp.zip'
    }),
    generate({
      file: 'version.txt',
      content: `${new Date().getTime()}`
    })
  ]
};
