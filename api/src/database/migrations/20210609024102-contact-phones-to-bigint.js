'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Contacts','phonen', {
        type: Sequelize.DataTypes.BIGINT
      }, { transaction });
      await queryInterface.addColumn('Contacts','phone2n', {
        type: Sequelize.DataTypes.BIGINT
      }, { transaction });
      await queryInterface.sequelize.query(`UPDATE "Contacts" SET phonen = CAST(COALESCE(NULLIF(regexp_replace(phone,'[^0123456789]*','','g'),'')) as BIGINT), phone2n = CAST(COALESCE(NULLIF(regexp_replace(phone2,'[^0123456789]*','','g'),'')) AS BIGINT)`,{ transaction });
      await queryInterface.removeColumn('Contacts','phone', { transaction });
      await queryInterface.removeColumn('Contacts','phone2', { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE "Contacts" rename column phonen to phone`, { transaction });
      await queryInterface.sequelize.query(`ALTER TABLE "Contacts" rename column phone2n to phone2`, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Contacts','phone', { transaction });
      await queryInterface.removeColumn('Contacts','phone2', { transaction });
      await queryInterface.addColumn('Contacts','phone', {
        type: Sequelize.STRING(15)
      }, { transaction });
      await queryInterface.addColumn('Contacts','phone2', {
        type: Sequelize.STRING(15)
      }, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
