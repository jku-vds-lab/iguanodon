const webpackCommon = require('./webpack.common');
const {merge} = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(webpackCommon,{
  mode: "production",
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[fullhash].css'
    })
  ],
  module: {
    rules: [
      { // sass files
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader, // 3. Extract css into files
          'css-loader',   // 2. Translates CSS into CommonJS
          {               // 1. Compiles Sass to CSS
            loader: "sass-loader",
            options: {
              // Prefer `dart-sass`
              implementation: require("sass"),
            },
          }
        ],
      },
    ]
  }
});