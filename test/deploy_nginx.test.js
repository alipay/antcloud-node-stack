'use strict';

const path = require('path');
const mm = require('mm');
const coffee = require('coffee');
const mkdirp = require('mz-modules/mkdirp');
const rimraf = require('mz-modules/rimraf');
const { uploadPackage } = require('./utils');

const deployBin = path.join(__dirname, '../bin/deploy.js');
const homeDir = path.join(__dirname, 'tmp');

describe('test/deploy.test.js', () => {
  beforeEach(() => {
    mm(process.env, 'HOME', homeDir);
  });
  beforeEach(() => mkdirp(homeDir));
  afterEach(() => rimraf(homeDir));

  it('should start nginx', async () => {
    const nginxBin = path.join(__dirname, 'fixtures/bin/nginx');
    const nginxConf = path.join(__dirname, 'tmp/release/run/conf/nginx.conf');
    mm(process.env, 'PATH', `${path.join(__dirname, 'fixtures/bin')}:${process.env.PATH}`);
    await uploadPackage({ baseDir: homeDir, version: 'a', source: 'nginx.tgz' });
    await coffee.fork(deployBin, [ 'version=a' ])
      // .debug()
      .notExpect('stdout', /Got nginx pid/)
      .expect('stdout', /Start nginx with config conf\/nginx.conf/)
      .expect('stdout', new RegExp(`${nginxBin} -c ${nginxConf}`))
      .expect('code', 0)
      .end();
  });

});
