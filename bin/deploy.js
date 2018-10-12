'use strict';

const deploy = require('../lib/deploy');

deploy(process.argv.slice(2)).catch(err => {
  console.error(err.stack);
  process.exit(1);
});
