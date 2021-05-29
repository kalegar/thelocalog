'use strict';
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
   console.log('<><><><><><><><><><><><><><><>')
   console.log('<>WARNING: DEVELOPMENT BUILD<>');
   console.log('<><><><><><><><><><><><><><><>');
}
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

const logging = env === 'production' ? false : console.log;
config.logging = logging;

if (!logging) {
  console.log('Sequelize logging disabled.');
}

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

if ((process.env.SYNC_DB || 'no') === 'yes' && env === 'development') {
  console.log('Syncing DB');
  sequelize.sync( {force: true });
}

module.exports = db;
