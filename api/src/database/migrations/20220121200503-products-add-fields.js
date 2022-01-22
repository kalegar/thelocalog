'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('Products','inStock',Sequelize.DataTypes.BOOLEAN,{ transaction });
      await queryInterface.addColumn('Products','imageListing', 
        { 
          type: Sequelize.DataTypes.INTEGER, 
          references: {
            model: {
              tableName: 'Images'
            },
            key: 'id'
          },
        }, { transaction });
      await queryInterface.addColumn('Products', 'url', Sequelize.DataTypes.STRING, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Products','url',{ transaction });
      await queryInterface.removeColumn('Products','imageListing', { transaction });
      await queryInterface.removeColumn('Products','inStock', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
