'use strict';

import clspPlayerUtils from '@skylineos/clsp-player/src/js/utils/utils';
import Logger from '@skylineos/clsp-player/src/js/utils/logger';

import {
  version,
  name,
} from '~root/package.json';

export default {
  // This gives us the backwards-compatible utils
  ...clspPlayerUtils,
  version,
  name: name.split('/').pop(),
  Logger,
  // This gives us access to the clsp player version and name (and of course, it
  // duplicates the utils)
  clspPlayerUtils,
};
