import '../styles/videojs-clsp.scss';

import plugin from './plugin';
import utils from './utils';

if (!window.clspUtils) {
  window.clspUtils = utils;
}

const clspPlugin = plugin();

// @todo - do not initialize the plugin by default, since that is a side
// effect.  make the caller call the initialize function.  also, is it
// possible to unregister the plugin?
clspPlugin.register();

export default clspPlugin;
