'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query('ALTER TABLE '+
                                           '  "Merchants" '+
                                           'ADD COLUMN "franchise" BOOLEAN, '+
                                           'ADD COLUMN "marketVendor" BOOLEAN, '+
                                           'ADD COLUMN "independent" BOOLEAN, '+
                                           'ADD COLUMN "canadianOwned" BOOLEAN;',
                                            { transaction });
      await queryInterface.sequelize.query(`UPDATE "Merchants" SET "franchise" = true WHERE "type" iLike '%franchise%';`, { transaction });
      await queryInterface.sequelize.query(`UPDATE "Merchants" SET "marketVendor" = true WHERE "type" iLike '%market vendor%';`, { transaction });
      await queryInterface.sequelize.query(`UPDATE "Merchants" SET "independent" = true WHERE "type" iLike '%independent%' or "type" iLike '%locally owned business%';`, { transaction });
      await queryInterface.sequelize.query(`UPDATE "Merchants" SET "canadianOwned" = true WHERE "type" iLike '%canadian%' and type not iLike '%non%';`, { transaction });
      await queryInterface.sequelize.query(`UPDATE "Merchants" SET "canadianOwned" = false WHERE "type" iLike '%canadian%' and type iLike '%non%';`, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {

      await queryInterface.sequelize.query('ALTER TABLE '+
                                           '  "Merchants" '+
                                           'DROP COLUMN "franchise", '+
                                           'DROP COLUMN "marketVendor", '+
                                           'DROP COLUMN "independent", '+
                                           'DROP COLUMN "canadianOwned";',
                                            { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
