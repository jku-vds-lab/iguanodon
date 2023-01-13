const webpackCommon = require('./webpack.common');
const {merge} = require('webpack-merge');
const path = require('path');

module.exports = merge(webpackCommon,{
  devtool: "inline-source-map",
  mode: "development",
  module: {
    rules: [
      { // sass files
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader', // 3. Injects styles into DOM
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
  },
  // chagnes in the webpack-dev-server package from v3 to v4 -> https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    port: 8080,
    // live reload of index.html -> https://stackoverflow.com/questions/69542243/webpack-devserver-v-4-x-x-live-reload-not-working
    hot: false, // optional, but you must not set both hot and liveReload to true
    liveReload: true
  }
});