'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Merchants', 'deletedAt',Sequelize.DATE);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Merchants', 'deletedAt');
  }
};
