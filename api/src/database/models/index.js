'use strict';
require('dotenv').config();

import logger from "../../service/logger.service";

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
   logger.warn('<><><><><><><><><><><><><><><>')
   logger.warn('<>WARNING: DEVELOPMENT BUILD<>');
   logger.warn('<><><><><><><><><><><><><><><>');
}else{
   logger.debug('Starting Sequelize');
}
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

const logging = env === 'production' ? false : msg => logger.debug(msg);
config.logging = logging;

if (!logging) {
  logger.info('Sequelize logging disabled.');
}

let sequelize;
let databaseURL = '';
if (config.use_env_variable) {
  if (process.env.DATABASE_URL === undefined) {
    logger.error("Undefined database env variable.");
  }else{
    databaseURL = process.env.DATABASE_URL;
    console.log("Database URL: ");
    console.log(databaseURL);
  }
}else{
  logger.warn("Not using env database variable.");
}

if (databaseURL !== '') {
  sequelize = new Sequelize(databaseURL, config);
} else {
  logger.warn("Empty database URL.");
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
  logger.warn('Syncing DB');
  sequelize.sync( {force: true });
}

module.exports = db;
