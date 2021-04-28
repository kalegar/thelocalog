'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     await queryInterface.addColumn('Merchants', 'type', Sequelize.STRING);
  },

  down: async (queryInterface, Sequelize) => {
     await queryInterface.removeColumn('Merchants', 'type');
  }
};
