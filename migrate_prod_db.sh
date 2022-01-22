cd ./api/
NODE_ENV=production npx sequelize-cli db:migrate --url "postgres://localogprod%40localog-prod:mb79UbDC38JohxEr6EQEWTRsv@localog-prod.postgres.database.azure.com/postgres"
read -n 1 -s -r -p "Press any key to continue"