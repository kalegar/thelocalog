'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Merchant, {
        foreignKey: {
          allowNull: false
        }
      });
      Product.Tags = Product.belongsToMany(models.Tag, { through: 'ProductTags' });
    }
  };
  Product.init({
    id: {type: DataTypes.UUID, allowNull: false, primaryKey: true, validate: { notNull: true }, defaultValue: Sequelize.UUID4 },
    MerchantId: {type: DataTypes.UUID, allowNull: false },
    title: {type: DataTypes.STRING, allowNull: false},
    price: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};