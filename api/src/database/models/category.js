'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Category.belongsToMany(models.Merchant, { through: 'MerchantCategories' });
      Category.belongsToMany(models.Product,  { through: 'ProductCategories' });
    }
  };
  Category.init({
    category: {
      type: DataTypes.STRING,
      unique: true,
      set(value) {
        this.setDataValue('category',value.toUpperCase());
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
    timestamps: false
  });
  return Category;
};