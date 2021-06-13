'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`ALTER TABLE "MerchantClaims" ALTER COLUMN text TYPE TEXT`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`ALTER TABLE "MerchantClaims" ALTER COLUMN text TYPE VARCHAR(255)`);
  }
};
