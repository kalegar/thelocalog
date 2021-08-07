'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Merchants', 'onlineShopping',Sequelize.BOOLEAN, { transaction });
      await queryInterface.sequelize.query('UPDATE "Merchants" SET \"onlineShopping\" = FALSE', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Merchants', 'onlineShopping');
  }
};
