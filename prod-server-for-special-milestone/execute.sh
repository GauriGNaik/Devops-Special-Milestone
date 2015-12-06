#!/bin/sh
apt-get -y update
apt-get install -y build-essential
apt-get install -y nodejs
ln -s /usr/bin/nodejs /usr/bin/node
apt-get install -y npm
apt-get install -y redis-server
cd /var/projects/production
npm install
npm install forever -g
redis-server &
forever start --minUptime 1000 --spinSleepTime 1000 /var/projects/production/app_with_feature.js 159.203.139.27
