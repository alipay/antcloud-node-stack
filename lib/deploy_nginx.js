'use strict';

const path = require('path');
const sleep = require('mz-modules/sleep');
const runscript = require('runscript');

module.exports = async (baseDir, config) => {
  const { bin_path, conf_path } = config.nginx;
  const pids = await getPids(bin_path);
  if (pids.length) {
    console.info('Got nginx pid %s, by %s', pids, bin_path);
    for (const pid of pids) {
      console.info('Stop nginx %s', pid);
      process.kill(pid);
      await sleep(2000);
    }
  }

  console.info('Start nginx with config %s', conf_path);
  await runscript(`${bin_path} -c ${path.join(baseDir, conf_path)}`);
};

async function getPids(nginxBinName) {
  const cmd = `ps -C ${nginxBinName} -f | grep '[m]aster process'`;
  try {
    const stdio = await runscript(cmd, { stdio: 'pipe' });
    return stdio.stdout
      .toString()
      .split('\n')
      .map(str => str.split(/\s+/)[1])
      .filter(str => !!str);
  } catch (err) {
    return [];
  }
}
