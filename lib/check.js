'use strict';

const path = require('path');
const urllib = require('urllib');
const getConfig = require('./config');

const runningDir = path.join(process.env.HOME, '/release/run');

module.exports = async args => {
  console.info('Health Check');
  console.info('Receive arguments: %j', args);

  const config = getConfig(runningDir);
  const checkPort = config.health_check.port;
  const checkPath = config.health_check.path;
  const expectedStatus = config.health_check.status;
  const expectedBody = config.health_check.body;

  // 未开启，不进行检测
  if (!config.health_check.enable) return true;

  const url = 'http://127.0.0.1:' + checkPort + checkPath;
  console.info('Request %s for health check', url);
  let res;
  try {
    res = await urllib.request(url);
  } catch (_) {
    return false;
  }
  const body = res.data.toString() || '';
  // 匹配返回的 status
  if (res.status !== expectedStatus) return false;
  // 匹配返回的 body
  if (expectedBody && !body.includes(expectedBody)) return false;
  return true;
};
