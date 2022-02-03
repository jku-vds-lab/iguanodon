const webpackCommon = require('./webpack.common');
const path = require('path');

module.exports = {
  ...webpackCommon,
  devtool: "inline-source-map",
  mode: "development",
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
};