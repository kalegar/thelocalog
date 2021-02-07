'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Address.belongsToMany(models.Merchant, { through: 'MerchantAddresses' });
      Address.hasOne(models.Contact);
    }
  };
  Address.init({
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    address3: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING(2),
    country: DataTypes.STRING(2),
    postalcode: DataTypes.STRING(20),
    neighbourhood: DataTypes.STRING(70),
    full: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Address',
    timestamps: false
  });
  return Address;
};