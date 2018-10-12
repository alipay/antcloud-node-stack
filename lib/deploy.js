'use strict';

const path = require('path');
const fs = require('mz/fs');
const runscript = require('runscript');
const getConfig = require('./config');
const deployNginx = require('./deploy_nginx');

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

  if (config.nginx.enable === true) {
    await deployNginx(runningDir, config);
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

