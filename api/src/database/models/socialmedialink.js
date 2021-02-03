'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SocialMediaLink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SocialMediaLink.belongsTo(models.Merchant, {
        foreignKey: { 
          allowNull: false
        }
      });
    }
  };
  SocialMediaLink.init({
    MerchantId: {type: DataTypes.UUID, allowNull: false, unique: 'compositeIndex'},  
    name: {type: DataTypes.STRING, allowNull: false, unique: 'compositeIndex', set(value) {
        this.setDataValue('name',value.toUpperCase());
      }},
    displayName: {type: DataTypes.STRING, allowNull: false},
    url: {type: DataTypes.STRING, allowNull: false}
  }, {
    sequelize,
    modelName: 'SocialMediaLink',
    timestamps: false
  });
  return SocialMediaLink;
};