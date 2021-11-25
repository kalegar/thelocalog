'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('PostGIS MUST BE INSTALLED ON THE POSTGRESQL SERVER!!!!')
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query('CREATE EXTENSION postgis;', { transaction });
      // await queryInterface.sequelize.query('CREATE EXTENSION postgis_raster;', { transaction });
      await queryInterface.sequelize.query('CREATE EXTENSION postgis_topology;', { transaction });
      await queryInterface.sequelize.query('CREATE EXTENSION postgis_sfcgal;', { transaction });
      await queryInterface.sequelize.query('CREATE EXTENSION fuzzystrmatch;', { transaction });
      await queryInterface.sequelize.query('CREATE EXTENSION address_standardizer;', { transaction });
      await queryInterface.sequelize.query('CREATE EXTENSION address_standardizer_data_us;', { transaction });
      await queryInterface.sequelize.query('CREATE EXTENSION postgis_tiger_geocoder;', { transaction });
      await queryInterface.addColumn('Addresses', 'geom',Sequelize.DataTypes.GEOMETRY('POINT', 4326), { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Addresses', 'geom');
  }
};
