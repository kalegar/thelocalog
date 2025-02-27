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
      Product.belongsToMany(models.Tag, { through: 'ProductTags' });
      Product.belongsToMany(models.Category, { through: 'ProductCategories' });

      Product.belongsTo(models.Image, {
        foreignKey: {
          name: 'imageListing'
        }
      });
    }
  };
  Product.init({
    id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
    MerchantId: {type: DataTypes.UUID, allowNull: false },
    externalId: DataTypes.STRING,
    title: {type: DataTypes.STRING, allowNull: false},
    price: DataTypes.DECIMAL,
    stock: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    inStock: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    imageListing: DataTypes.INTEGER,
    url: DataTypes.STRING,
    imageUrl: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};