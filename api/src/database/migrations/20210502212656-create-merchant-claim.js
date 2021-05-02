'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MerchantClaims', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      MerchantId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'Merchants'
          },
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      UserId: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'Users'
          },
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      text: {
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MerchantClaims');
  }
};
