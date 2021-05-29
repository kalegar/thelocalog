rm -r ./localog
cd ../api/
NODE_ENV=production npx sequelize-cli db:migrate
npm run build
cd ../merchantapp/
npm run build
cd ../build/
mkdir localog
mkdir ./localog/api
mkdir ./localog/assets
cp -R ../api/dist/* ./localog/api
cp ../api/package*.json ./localog/api
cp ../api/src/assets/* ./localog/assets
mkdir ./localog/merchantapp/
mkdir ./localog/merchantapp/dist
cp -R ../merchantapp/dist/* ./localog/merchantapp/dist
cp ../merchantapp/package*.json ./localog/merchantapp
cp ./prod.env ./localog/.env
rm -r ../api/dist
rm -r ../merchantapp/dist