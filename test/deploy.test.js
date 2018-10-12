'use strict';

const assert = require('assert');
const path = require('path');
const mm = require('mm');
const fs = require('mz/fs');
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

  it('should deploy success', async () => {
    await uploadPackage({ baseDir: homeDir, version: 'a', source: 'nodeserver.tgz' });

    await coffee.fork(deployBin, [ 'version=a', 'a' ])
      // .debug()
      .expect('stdout', /Receive arguments: \["version=a","a"]/)
      .expect('stdout', new RegExp(`Link ${path.join(homeDir, 'release/a')} to ${path.join(homeDir, 'release/run')}`))
      .expect('stdout', /Unpack nodeserver.tgz/)
      .expect('stdout', /Start application/)
      .expect('stdout', /server.js start/)
      .expect('code', 0)
      .end();

    const link = await fs.readlink(path.join(homeDir, 'release/run'));
    assert(link === path.join(homeDir, 'release/a'));
  });

  it('should deploy twice same version', async () => {
    await uploadPackage({ baseDir: homeDir, version: 'a', source: 'nodeserver.tgz' });

    await coffee.fork(deployBin, [ 'version=a' ])
      // .debug()
      .expect('code', 0)
      .end();
    let link = await fs.readlink(path.join(homeDir, 'release/run'));
    assert(link === path.join(homeDir, 'release/a'));

    await coffee.fork(deployBin, [ 'version=a' ])
      // .debug()
      .expect('stdout', /Remove "package.json server.js"/)
      .expect('stdout', /Stop application/)
      .expect('stdout', /Unpack nodeserver.tgz/)
      .expect('stdout', /server.js stop/)
      .expect('stdout', /server.js start/)
      .expect('code', 0)
      .end();
    link = await fs.readlink(path.join(homeDir, 'release/run'));
    assert(link === path.join(homeDir, 'release/a'));
  });

  it('should deploy twice different version', async () => {
    await uploadPackage({ baseDir: homeDir, version: 'a', source: 'nodeserver.tgz' });

    await coffee.fork(deployBin, [ 'version=a' ])
      // .debug()
      .expect('code', 0)
      .end();
    let link = await fs.readlink(path.join(homeDir, 'release/run'));
    assert(link === path.join(homeDir, 'release/a'));

    await uploadPackage({ baseDir: homeDir, version: 'b', source: 'nodeserver.tgz' });
    await coffee.fork(deployBin, [ 'version=b' ])
      // .debug()
      .expect('stdout', /Stop application/)
      .expect('stdout', /server.js stop/)
      .expect('stdout', /server.js start/)
      .expect('code', 0)
      .end();
    link = await fs.readlink(path.join(homeDir, 'release/run'));
    assert(link === path.join(homeDir, 'release/b'));
  });

  it('should exit when version is empty', async () => {
    await coffee.fork(deployBin)
      // .debug()
      .expect('stderr', /version is required/)
      .expect('code', 1)
      .end();
  });

  it('should exit when new release directory is not found', async () => {
    await coffee.fork(deployBin, [ 'version=a' ])
      // .debug()
      .expect('stderr', new RegExp(`Directory ${path.join(homeDir, 'release/a')} don't exist`))
      .expect('code', 1)
      .end();
  });

  it('should exit when no tgz file', async () => {
    await mkdirp(path.join(homeDir, 'release/a'));

    await coffee.fork(deployBin, [ 'version=a' ])
      // .debug()
      .expect('stderr', /Can't find tgz/)
      .expect('code', 1)
      .end();
  });

  it('should exit when more than one tgz file', async () => {
    await uploadPackage({ baseDir: homeDir, version: 'a', source: 'nodeserver.tgz' });
    await uploadPackage({ baseDir: homeDir, version: 'a', source: 'nodeserver-error.tgz' });

    await coffee.fork(deployBin, [ 'version=a' ])
      // .debug()
      .expect('stderr', /Find 2 tgz, nodeserver-error.tgz,nodeserver.tgz/)
      .expect('code', 1)
      .end();
  });

});
