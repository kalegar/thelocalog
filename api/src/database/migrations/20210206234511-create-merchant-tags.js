'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('MerchantTags', {
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        TagId: {
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Tags',
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
    await queryInterface.dropTable('MerchantTags');
  }
};
