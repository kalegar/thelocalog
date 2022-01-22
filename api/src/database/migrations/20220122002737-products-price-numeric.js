'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Products','pricen', {
        type: Sequelize.DataTypes.DECIMAL
      }, { transaction });
      await queryInterface.sequelize.query(`UPDATE "Products" SET pricen = CAST(price as NUMERIC)`,{ transaction });
      await queryInterface.removeColumn('Products','price', { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE "Products" rename column pricen to price`, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Products','price', { transaction });
      await queryInterface.addColumn('Products','price', {
        type: Sequelize.INTEGER
      }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
