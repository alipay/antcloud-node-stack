'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const extend = require('extend');

const defaultConfig = {
  health_check: {
    enable: false,
    port: 80,
    path: '/',
    status: 200,
    body: '',
  },
  nginx: {
    enable: false,
    bin_path: 'nginx',
    conf_path: 'conf/nginx.conf',
  },
};

module.exports = baseDir => {
  let config;
  try {
    config = fs.readFileSync(path.join(baseDir, '.nodestack'), 'utf8');
  } catch (_) {
    // nothing
  }

  try {
    config = yaml.safeLoad(config);
  } catch (e) {
    throw new Error('Parse yaml error: ' + e.message);
  }

  return extend(true, {}, defaultConfig, config);
};
