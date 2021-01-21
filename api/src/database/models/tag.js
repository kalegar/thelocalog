'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tag.belongsToMany(models.Merchant, { through: 'MerchantTags' });
      Tag.belongsToMany(models.Product, { through: 'ProductTags' });
    }
  };
  Tag.init({
    tag: {
      type: DataTypes.STRING,
      set(value) {
        this.setDataValue('tag',value.toUpperCase());
      }
    }
  }, {
    sequelize,
    modelName: 'Tag',
    timestamps: false
  });
  return Tag;
};