'use strict';

/**
 * This file needs to use `require` rather than `import` to be able to be used
 * by webpack.
 */

const clspPlayerUtils = require('@skylineos/clsp-player/src/js/utils/utils');
const Logger = require('@skylineos/clsp-player/src/js/utils/Logger');

const {
  version,
  name,
} = require('../../package.json');

module.exports = {
  // This gives us the backwards-compatible utils
  ...clspPlayerUtils,
  version,
  name: name.split('/').pop(),
  // The name that will be used to register this plugin with videojs, which in
  // practice will be used as `player.clsp()`
  pluginName: 'clsp',
  Logger,
  // This gives us access to the clsp player version and name (and of course, it
  // duplicates the utils)
  clspPlayerUtils,
};
