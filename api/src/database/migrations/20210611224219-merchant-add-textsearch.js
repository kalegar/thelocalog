'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('ALTER TABLE "Merchants" ADD COLUMN textsearch TSVECTOR');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Merchants','textsearch');
  }
};
