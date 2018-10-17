'use strict';

const path = require('path');
const http = require('http');
const mm = require('mm');
const coffee = require('coffee');
const fs = require('mz/fs');
const mkdirp = require('mz-modules/mkdirp');
const rimraf = require('mz-modules/rimraf');

const checkBin = path.join(__dirname, '../bin/check.js');
const homeDir = path.join(__dirname, 'tmp');
const releaseDir = path.join(homeDir, 'release');

describe('test/check.test.js', () => {
  let server;

  beforeEach(() => {
    mm(process.env, 'HOME', homeDir);
  });
  beforeEach(() => mkdirp(releaseDir));
  afterEach(() => rimraf(homeDir));
  afterEach(done => {
    if (!server) done();
    server.close(() => {
      server = null;
      done();
    });
  });

  describe('check status', () => {
    beforeEach(async () => {
      await fs.symlink(
        path.join(__dirname, 'fixtures/check-status'),
        path.join(homeDir, 'release/run')
      );
    });

    it('should success', async () => {
      server = await createServer(200);

      await coffee.fork(checkBin)
        .debug()
        .expect('stdout', /Request http:\/\/127.0.0.1:7001\/healthy for health check/)
        .expect('code', 0)
        .end();
    });

    it('should fail', async () => {
      server = await createServer(500);

      await coffee.fork(checkBin)
        .debug()
        .expect('code', 1)
        .end();
    });
  });

  describe('check body', () => {
    beforeEach(async () => {
      await fs.symlink(
        path.join(__dirname, 'fixtures/check-body'),
        path.join(homeDir, 'release/run')
      );
    });

    it('should success', async () => {
      server = await createServer(200, 'healthy');

      await coffee.fork(checkBin)
        .debug()
        .expect('stdout', /Request http:\/\/127.0.0.1:7001\/healthy for health check/)
        .expect('code', 0)
        .end();
    });

    it('should fail', async () => {
      server = await createServer(200, 'unknown');

      await coffee.fork(checkBin)
        .debug()
        .expect('stdout', /Request http:\/\/127.0.0.1:7001\/healthy for health check/)
        .expect('code', 1)
        .end();
    });

  });

  describe('check without listen', () => {
    beforeEach(async () => {
      await fs.symlink(
        path.join(__dirname, 'fixtures/check-unlisten'),
        path.join(homeDir, 'release/run')
      );
    });

    it('should fail', async () => {
      await coffee.fork(checkBin)
        .debug()
        .expect('stdout', /Request http:\/\/127.0.0.1:7002\/healthy for health check/)
        .expect('code', 1)
        .end();
    });
  });

});

function createServer(status, body) {
  const server = http.createServer((req, res) => {
    res.statusCode = status;
    res.end(body || '');
  });
  return new Promise(resolve => {
    server.listen(7001, () => resolve(server));
  });
}
