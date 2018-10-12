#!/usr/bin/env bash

set -o pipefail

readonly DEPLOY_LOGFILE=$HOME/logs/deploy.log
readonly NODEDIR=$BASEDIR/resources/node

log_info() {
  echo $(date +"%F %T") [INFO] $@ >> $DEPLOY_LOGFILE
}

log_error() {
  echo $(date +"%F %T") [ERROR] $@ >> $DEPLOY_LOGFILE
}

pipe_log_info() {
  while read line ; do
    log_info $line
  done
}

error_exit() {
  log_error $@
  # print all log to stdout
  cat $DEPLOY_LOGFILE
  echo "Deploy error, start to exit"
  exit 1
}

init_log()
{
  if [ ! -d $HOME/logs ]; then
    mkdir -p $HOME/logs
  fi

  # rotate log
  if [ -f $DEPLOY_LOGFILE ]; then
    local DEPLOY_LOGFILE_BAK=$DEPLOY_LOGFILE.`date +%m%d%H%M%S`
    log_info "rename to $DEPLOY_LOGFILE_BAK"
    mv $DEPLOY_LOGFILE $DEPLOY_LOGFILE_BAK
  fi
}
