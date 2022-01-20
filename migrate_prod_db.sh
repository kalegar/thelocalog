cd ./api/
NODE_ENV=production npx sequelize-cli db:migrate
read -n 1 -s -r -p "Press any key to continue"