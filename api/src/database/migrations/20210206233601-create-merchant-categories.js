'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('MerchantCategories', {
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        CategoryId: {
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Categories',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        },
        MerchantId: {
          primaryKey: true,
          allowNull: false,
          type: Sequelize.UUID,
          references: {
            model: 'Merchants',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        }
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MerchantCategories');
  }
};
