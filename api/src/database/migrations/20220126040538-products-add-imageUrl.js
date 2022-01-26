'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Products','imageUrl',Sequelize.DataTypes.STRING);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('Products','imageUrl');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
