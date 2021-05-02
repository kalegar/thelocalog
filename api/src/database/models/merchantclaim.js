'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MerchantClaim extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      MerchantClaim.belongsTo(models.Merchant, {
        foreignKey: { 
          allowNull: false
        }
      });
      MerchantClaim.belongsTo(models.User, {
          foreignKey: {
              allowNull: false
          }
      });
    }
  };
  MerchantClaim.init({
    MerchantId: {type: DataTypes.UUID, allowNull: false},  
    UserId: {type: DataTypes.STRING, allowNull: false},
    text: {type: DataTypes.STRING}
  }, {
    sequelize,
    modelName: 'MerchantClaim'
  });
  return MerchantClaim;
};