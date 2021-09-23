'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      //Merchants
      await queryInterface.sequelize.query('CREATE INDEX merchants_title_idx ON "Merchants" (title)', { transaction });
      //Add pg_trgm extension
      await queryInterface.sequelize.query('CREATE EXTENSION pg_trgm', { transaction });
      await queryInterface.sequelize.query('CREATE INDEX merchants_title_trgm_idx ON "Merchants" USING gin (title gin_trgm_ops)', { transaction });

      //MerchantImages
      await queryInterface.sequelize.query('CREATE INDEX merchantimages_merchantid_idx ON "MerchantImages" ("MerchantId")', { transaction });
      await queryInterface.sequelize.query('CREATE INDEX merchantimages_imageid_idx ON "MerchantImages" ("ImageId")', { transaction });
      //Images
      await queryInterface.sequelize.query('CREATE INDEX images_type_trgm_idx ON "Images" USING gin (type gin_trgm_ops)', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS images_type_trgm_idx', { transaction });

      await queryInterface.sequelize.query('DROP INDEX IF EXISTS merchantimages_imageid_idx', { transaction });
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS merchantimages_merchantid_idx', { transaction });
      
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS merchants_title_trgm_idx', { transaction });
      await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS pg_trgm', { transaction });

      await queryInterface.sequelize.query('DROP INDEX IF EXISTS merchants_title_idx', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
