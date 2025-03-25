'use strict';

const path = require('path');
const _WebpackDevServer = require('webpack-dev-server');

const WatchCompiler = require('../watch/WatchCompiler');

// @todo - the devServer.sh can make this path an environment variable from utils.sh
const APPLICATION_DIR = path.join(__dirname, '..', '..');

module.exports = class WebpackDevServer {
  static factory () {
    return new WebpackDevServer();
  }

  constructor () {
    this.watchCompiler = WatchCompiler.factory();

    this.devServerConfig = {
      // when compression is enabled, things are served VERY slowly
      compress: false,
      // do not hot reload the browser on change - breaks ie11 (maybe you can fix it)
      hot: false,
      // The directory that will be served (in our case, project root)
      static: APPLICATION_DIR,
    };

    this.server = new _WebpackDevServer(this.devServerConfig, this.watchCompiler.compiler);
  }
};
