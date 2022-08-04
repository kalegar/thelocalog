'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products','externalId',Sequelize.DataTypes.STRING);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Products','externalId');
  }
};
