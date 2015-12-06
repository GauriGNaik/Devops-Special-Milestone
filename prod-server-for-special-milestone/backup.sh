!/bin/sh
touch pkglist
sudo dpkg --get-selections | sed "s/.*deinstall//" | sed "s/install$//g" > /var/projects/production/pkglist
ssh root@45.55.53.130 'mkdir -p /var/projects/production && exit'
echo "Starting the transfer of data to backup instance"
rsync -az --progress --exclude='node_modules' /var/projects/production/ root@45.55.53.130:/var/projects/production
echo "Completed the transfer of data to backup instance"
echo "Installing dependencies and running the app on backup instance"
ssh root@45.55.53.130 'chmod +x /var/projects/production/execute.sh && cd /var/projects/production && ./execute.sh && exit '
