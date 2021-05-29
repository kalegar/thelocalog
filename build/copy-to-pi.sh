ssh pi@raspberrypi4 "pkill node && rm -r ~/localog/*"
scp -r ./localog/* pi@raspberrypi4:~/localog
ssh pi@raspberrypi4 "cd ~/localog/api && npm install --production && cd ~/localog/merchantapp && npm install --production"