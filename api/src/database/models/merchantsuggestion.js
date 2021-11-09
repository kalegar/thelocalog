'use strict';

const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantSuggestion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  MerchantSuggestion.init({
    id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
    email: { type: DataTypes.STRING, allowNull: false},
    title: { type: DataTypes.STRING, allowNull: false},
    category: DataTypes.STRING,
    address: DataTypes.STRING,
    extra: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'MerchantSuggestion',
  });
  return MerchantSuggestion;
};