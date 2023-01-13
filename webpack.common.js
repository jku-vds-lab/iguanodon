// Taken from : https://webpack.js.org/guides/typescript/
// plus:  https://github.com/webpack-contrib/sass-loader

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");


module.exports = {
  entry: {
    main: './src/index.ts',
  },
  output: {
    filename: '[name].[fullhash].js', // <- ensure unique bundle name
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      { // typescript files
        test: /\.ts(x)?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      // { // sass files
      //   test: /\.s[ac]ss$/i,
      //   use: [
      //     'style-loader', // 3. Injects styles into DOM
      //     'css-loader',   // 2. Translates CSS into CommonJS
      //     {               // 1. Compiles Sass to CSS
      //       loader: "sass-loader",
      //       options: {
      //         // Prefer `dart-sass`
      //         implementation: require("sass"),
      //       },
      //     }
      //   ],
      // },
      {
        test: /\.json$/,
        type: 'json',
        generator: {
          filename: 'data/[name][ext]'
        }, 
      },
      {
        test: /\.(csv|tsv)$/i,
        use: ['csv-loader'],
      },     
      { // fonts and SVGs 
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        },
      },
      { // images
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/templates/index.html"),
      
    })
  ]
};