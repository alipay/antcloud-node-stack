'use strict';

const path = require('path');
const assert = require('assert');
const getConfig = require('../lib/config');


describe('test/config.test.js', () => {

  it('should load config', () => {
    const config = getConfig(path.join(__dirname, 'fixtures/config'));
    assert(config.nginx.enable === true);
  });

  it('should load config fail when yaml parsing error', () => {
    try {
      getConfig(path.join(__dirname, 'fixtures/config-error'));
      throw new Error('should not run');
    } catch (err) {
      assert(err.message.includes('Parse yaml error: '));
    }
  });

});
