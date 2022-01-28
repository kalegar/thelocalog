'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('ProductCategories', {
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
        ProductId: {
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Products',
            key: 'id'
          },
          onUpdate: 'cascade',
          onDelete: 'cascade'
        }
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ProductCategories');
  }
};
