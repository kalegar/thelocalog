'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Merchant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Merchant.hasMany(models.Product);
      Merchant.hasMany(models.SocialMediaLink);
      Merchant.hasMany(models.MerchantClaim);
      Merchant.belongsToMany(models.Image, { through: 'MerchantImages' });
      Merchant.belongsToMany(models.Tag, { through: 'MerchantTags' });
      Merchant.belongsToMany(models.Category, { through: 'MerchantCategories' });
      Merchant.belongsToMany(models.User, { through: 'MerchantOwners' });
      Merchant.Addresses = Merchant.belongsToMany(models.Address, { through: 'MerchantAddresses' });
    }
  };
  Merchant.init({
    id: { type: DataTypes.UUID, allowNull: false, primaryKey: true, validate: { notNull: true }, defaultValue: Sequelize.UUIDV4 },
    title: { type: DataTypes.STRING, allowNull: false},
    website: DataTypes.STRING,
    type: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Merchant',
    paranoid: true
  });
  return Merchant;
};