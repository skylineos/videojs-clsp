// This is configured as an external library by webpack, so the caller must
// provide videojs on `window`
import videojs from 'video.js';

import ClspHandler from './ClspHandler';
import utils from './utils';

export default function () {
  const logger = utils.Logger().factory('ClspSourceHandler');

  return function (mode) {
    const obj = {
      canHandleSource: function (srcObj, options = {}) {
        logger.debug('canHandleSource');

        if (!srcObj.src) {
          logger.debug("srcObj doesn't contain src");
          return false;
        }

        if (!srcObj.src.startsWith('clsp')) {
          logger.debug('srcObj.src is not clsp protocol');
          return false;
        }

        // Note that we used to do a browser compatibility check here, but if
        // we return false when the browser does not support CLSP, videojs's
        // failover mechanisms do not continue.  Meaning, if we return false
        // here, and a second HLS source is supplied in the video tag (for
        // example), videojs will never try to play the HLS url with the HLS
        // tech.

        return obj.canPlayType(srcObj.type);
      },
      handleSource: function (
        source,
        tech,
        options = {},
      ) {
        logger.debug('handleSource');

        const localOptions = videojs.mergeOptions(
          videojs.options,
          options,
          {
            clsp: {
              mode,
            },
          },
        );

        tech.clsp = new ClspHandler(
          source,
          tech,
          localOptions,
        );

        return tech.clsp;
      },
      canPlayType: function (type) {
        logger.debug('canPlayType');

        if (utils.isSupportedMimeType(type)) {
          return 'maybe';
        }

        // eslint-disable-next-line no-console
        console.error(`clsp type='${type}' rejected`);

        return '';
      },
    };

    return obj;
  };
}
