'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('SocialMediaLinks', 'SocialMediaLinks_MerchantId_name_uk');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('SocialMediaLinks', {
      fields: ['MerchantId','name'],
      type: 'unique'
    });
  }
};
