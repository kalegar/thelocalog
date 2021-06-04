ssh pi@raspberrypi4 "rm -rf ~/localogstaging && mkdir ~/localogstaging"
scp -r ./localog/* pi@raspberrypi4:~/localogstaging