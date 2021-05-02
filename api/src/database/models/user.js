'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsToMany(models.Merchant, { through: 'MerchantOwners' });
      User.hasMany(models.MerchantClaim);
    }
  };
  User.init({
    id: {
      type: DataTypes.STRING,
      allowNull: false, primaryKey: true, validate: { notNull: true },
      unique: true
    }
  }, {
    sequelize,
    modelName: 'User'
  });
  return User;
};