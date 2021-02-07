'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('SocialMediaLinks', {
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
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        displayName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        url: {
          type: Sequelize.STRING,
          allowNull: false
        }
      }, { transaction });
      await queryInterface.addConstraint('SocialMediaLinks', {
        fields: ['MerchantId','name'],
        type: 'unique',
        transaction
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SocialMediaLinks');
  }
};
