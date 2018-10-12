'use strict';

const action = process.argv[2];

if (action === 'start') {
  console.info('server.js start error');
}

if (action === 'stop') {
  console.info('server.js stop error');
}

process.exit(1);
