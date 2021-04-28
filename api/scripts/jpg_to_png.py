from PIL import Image
import os
import sys

if len(sys.argv) < 2:
    print('must specify filepath')
    sys.exit(0)

imgPath = sys.argv[1]
delete = False

if len(sys.argv) >= 3:
    delete = True
def convert_image(path):
    try:
        inf = os.path.splitext(path)
        if inf[1] != '.png':
            if os.path.isfile(inf[0] + '.png'):
                print('png of ' + inf[0] + ' already exists!')
            else:
                img = Image.open(path)
                img.save(inf[0] + '.png')
                print("Converted '" + inf[0] + "' to png.")
            if delete:
                os.remove(path)
    except FileNotFoundError:
        print('No image found at ' + path)



if os.path.isfile(imgPath):
    convert_image(imgPath)
elif os.path.isdir(imgPath):
    for filename in os.listdir(imgPath):
        convert_image(imgPath + filename)
else:
    print('Unknown path: ' + imgPath)
