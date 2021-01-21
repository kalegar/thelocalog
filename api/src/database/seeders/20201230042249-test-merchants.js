'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await queryInterface.bulkInsert('Addresses', [
    {
      address1: '6510 112 ave',
      city: 'Edmonton',
      province: 'AB',
      country: 'CA'
    }
  ])   

   await queryInterface.bulkInsert('Merchants', [
     {
       title: 'Be-a-Bella',
       description: '',
       website: 'https://www.be-a-bella.com/',
       AddressId: 1,
       createdAt: new Date(),
       updatedAt: new Date()
     },
     {
       title: 'Sobeys',
       description: 'A Grocery Store',
       createdAt: new Date(),
       updatedAt: new Date()
     },
     {
       title: '7-Eleven',
       description: 'Convenience Store',
       createdAt: new Date(),
       updatedAt: new Date()
     }
   ]);

   await queryInterface.bulkInsert('Merchant_Tags', [
     {
       tag: 'candy',
       MerchantId: 1
     },
     {
       tag: 'pop',
       MerchantId: 1
     },
     {
       tag: 'popcorn',
       MerchantId: 1
     }
   ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Addresses',null, {});
    await queryInterface.bulkDelete('Merchants',null, {});
    await queryInterface.bulkDelete('Merchant_Tags',null, {});
  }
};
