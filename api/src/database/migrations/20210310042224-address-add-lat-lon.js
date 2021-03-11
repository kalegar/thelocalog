'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('PostGIS MUST BE INSTALLED ON THE POSTGRESQL SERVER!!!!')
    await queryInterface.addColumn('Addresses', 'geom',Sequelize.DataTypes.GEOMETRY('POINT', 4326));
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Addresses', 'geom');
  }
};
