'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint('Contacts', 'Contacts_AddressId_fkey', { transaction });
      await queryInterface.addConstraint('Contacts', {
        fields: ['AddressId'],
        type: 'foreign key',
        name: 'Contacts_AddressId_fkey',
        references: {
          table: 'Addresses',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        transaction: transaction
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint('Contacts', 'Contacts_AddressId_fkey', { transaction });
      await queryInterface.addConstraint('Contacts', {
        fields: ['AddressId'],
        type: 'foreign key',
        name: 'Contacts_AddressId_fkey',
        references: {
          table: 'Addresses',
          field: 'id'
        },
        transaction: transaction
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
