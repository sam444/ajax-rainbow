'use strict';

import baseConfig from './base';
import 'core-js/fn/object/assign';

let config = {
  appEnv: 'dev'  // feel free to remove the appEnv property here
};

export default Object.freeze(Object.assign({}, baseConfig, config));
