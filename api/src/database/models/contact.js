'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Contact.belongsTo(models.Address, {
        foreignKey: {
          allowNull: false
        }
      });
    }
  };
  Contact.init({
    AddressId: {type: DataTypes.INTEGER, allowNull: false },
    email: DataTypes.STRING,
    email2: DataTypes.STRING,
    phone: DataTypes.STRING(15),
    phonetype: DataTypes.STRING(5),
    phone2: DataTypes.STRING(15),
    phonetype2: DataTypes.STRING(5)
  }, {
    sequelize,
    modelName: 'Contact'
  });
  return Contact;
};