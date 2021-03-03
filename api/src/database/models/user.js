'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, validate: { notNull: true }, defaultValue: Sequelize.UUIDV4 },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: { type: DataTypes.STRING, allowNull: false, unique: true},
    password: DataTypes.STRING,
    permissionLevel: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};