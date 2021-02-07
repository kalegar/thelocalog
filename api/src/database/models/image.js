'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Image.belongsToMany(models.Merchant, { through: 'MerchantImages' });
    }
  };
  Image.init({
    title: {type: DataTypes.STRING, allowNull: false },
    type: {type: DataTypes.STRING, allowNull: false },
    image: {type:DataTypes.BLOB('long'), allowNull: false }
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};