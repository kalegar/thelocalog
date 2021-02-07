'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Contacts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      AddressId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Addresses'
          },
          key: 'id'
        }
      },
      email: {
        type: Sequelize.STRING
      },
      email2: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING(15)
      },
      phonetype: {
        type: Sequelize.STRING(5)
      },
      phone2: {
        type: Sequelize.STRING(15)
      },
      phonetype2: {
        type: Sequelize.STRING(5)
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
    await queryInterface.dropTable('Contacts');
  }
};
