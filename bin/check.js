'use strict';

const check = require('../lib/check');

check(process.argv.slice(2))
  .then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error(err.stack);
    process.exit(1);
  });
