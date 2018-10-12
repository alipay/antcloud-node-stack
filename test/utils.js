'use strict';

const path = require('path');
const mkdirp = require('mz-modules/mkdirp');
const cpy = require('cpy');

const packageDir = path.join(__dirname, 'fixtures/package');

exports.uploadPackage = async options => {
  const source = path.join(packageDir, options.source);
  const targetDir = path.join(options.baseDir, 'release', options.version);
  await mkdirp(targetDir);
  await cpy(source, targetDir);
};
