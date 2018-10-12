'use strict';

const path = require('path');
const fs = require('mz/fs');
const runscript = require('runscript');
const sleep = require('mz-modules/sleep');
const rimraf = require('mz-modules/rimraf');
const getConfig = require('./config');

const releaseDir = path.join(process.env.HOME, '/release');

module.exports = deploy;

async function deploy(args) {
  console.info('Receive arguments: %j', args);
  args = parseArg(args);

  if (!args.version) throw new Error('version is required');
  const newReleaseDir = path.join(releaseDir, args.version);
  const isNewReleaseDirExist = await fs.exists(newReleaseDir);
  if (!isNewReleaseDirExist) throw new Error(`Directory ${newReleaseDir} don't exist`);

  // check tgz files
  const files = await fs.readdir(newReleaseDir);
  const appFiles = files.filter(file => /.tgz$/.test(file));
  const removeFiles = files.filter(file => !/.tgz$/.test(file));
  if (appFiles.length === 0) throw new Error('Can\'t find tgz');
  if (appFiles.length > 1) throw new Error(`Find ${files.length} tgz, ${files.join(',')}`);
  const appFile = appFiles[0];

  const runningDir = path.join(releaseDir, 'run');
  const isRunningDirExist = await fs.exists(runningDir);

  // stop first
  if (isRunningDirExist) {
    console.info('Stop application');
    // stop the application using the script of application
    try {
      await runscript('npm stop', { cwd: runningDir });
    } catch (err) {
      console.error('npm stop error:', err.message);
    }
    console.info('');
  }

  if (removeFiles.length) {
    console.info('Remove "%s" under %s', removeFiles.join(' '), newReleaseDir);
    await runscript(`rm -rf ${removeFiles.join(' ')}`, { cwd: newReleaseDir });
    console.info('');
  }

  console.info('Unpack %s under', appFile, newReleaseDir);
  await runscript(`tar -zxf ${appFile}`, { cwd: newReleaseDir });
  console.info('');

  console.info('Link %s to %s', newReleaseDir, runningDir);
  if (isRunningDirExist) await fs.unlink(runningDir);
  await fs.symlink(newReleaseDir, runningDir);
  console.info('');

  const config = getConfig(newReleaseDir);
  if (config.install.enable === true) {
    await rimraf(path.join(releaseDir, args.version, 'node_modules'));

    console.info('Installing');
    if (config.install.cache === true) {
      console.info('Cache is enabled');
      await runscript(`cp ${args.version}/package.json .`, { cwd: releaseDir });
      await runscript('npm install --production --registry=https://registry.npm.taobao.org --no-package-lock', { cwd: releaseDir });
      await fs.symlink('../node_modules', path.join(runningDir, 'node_modules'));
    } else {
      console.info('Cache is disabled');
      await runscript('rm -rf node_modules', { cwd: releaseDir });
      await runscript(`cp ${args.version}/package.json .`, { cwd: releaseDir });
      await runscript('npm install --production --registry=https://registry.npm.taobao.org --no-package-lock', { cwd: releaseDir });
      await fs.symlink('../node_modules', path.join(runningDir, 'node_modules'));
    }
    console.info('');
  }

  if (config.nginx.enable === true) {
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
    await runscript(`${bin_path} -c ${path.join(runningDir, conf_path)}`);
  }

  // start the application using the script of application
  console.info('Start application');
  await runscript('npm start', { cwd: runningDir });
  console.info('');
}

function parseArg(args) {
  const result = {};
  for (const arg of args) {
    const m = arg.match(/^(.*?)=(.*)$/);
    if (!m) continue;
    result[m[1]] = m[2];
  }
  return result;
}

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
