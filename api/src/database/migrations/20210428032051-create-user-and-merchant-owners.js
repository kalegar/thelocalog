'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.createTable('MerchantOwners', {
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      UserId: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'Users',
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
    await queryInterface.dropTable('Users');
  }
};
