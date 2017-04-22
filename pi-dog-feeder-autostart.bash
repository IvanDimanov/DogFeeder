#! /bin/bash
#####################################################################
#
# INFO: The purpose of this script is to auto-run the DogFeeder app from
# https://github.com/IvanDimanov/DogFeeder
# on every RaspberryPi reboot.
#
# STEP 1: Watchout for these pre-reqirements:
#   - globally installed pm2: $ npm i -g pm2
#   - globally installed   n: $ npm i -g n
#   - project forlder /home/pi/projects/DogFeeder
#
# STEP 2: Install the script
#   - open file /etc/rc.local
#   - make the autostart executable by adding line:
#       sudo chmod 755 /home/pi/projects/DogFeeder/pi-dog-feeder-autostart.bash
#   - execute the autostart file by adding line:
#       su pi -c '/home/pi/projects/DogFeeder/pi-dog-feeder-autostart.bash'
#
# More info at https://raspberrypi.stackexchange.com/a/8735
#
#####################################################################

printf "\n------------------------------ Autostart: Starting Redis ------------------------------\n"
sudo redis-server /etc/redis/6379.conf

printf "\n------------------------------ Autostart: Preparing the node runner ------------------------------\n"
pm2 list

printf "\n------------------------------ Autostart: Grand nginx permissions ------------------------------\n"
sudo service nginx stop
sudo chmod 777 /run
sudo chmod -R 777 /var/log/nginx/

printf "\n------------------------------ Autostart: Start the app in the most Pi-related way ------------------------------\n"
cd /home/pi/projects/DogFeeder/
time sudo npm run bind-pi-hardware && npm run start-pi