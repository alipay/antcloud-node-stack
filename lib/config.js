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
    config = yaml.safeLoad(fs.readFileSync(path.join(baseDir, '.nodestack'), 'utf8'));
  } catch (e) {
    config = {};
  }

  return extend(true, {}, defaultConfig, config);
};
