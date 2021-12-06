'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `CREATE FUNCTION textsearch_vector_merchant_tags_trigger() RETURNS trigger AS $$
        DECLARE ts TSVECTOR; 
        begin
          WITH minfo (id, title, tags, description) AS (
            WITH mtags (id, tags) AS (
              SELECT m."MerchantId" AS id, string_agg(t.tag,' ') AS tags from "Tags" t join "MerchantTags" m on t.id = m."TagId" group by m."MerchantId"
            )
            SELECT m.id, m.title, mt.tags, m.description from "Merchants" m join "mtags" mt on m.id = mt.id where m.id = new."MerchantId"
          )
        SELECT INTO ts
            setweight(to_tsvector('pg_catalog.english', coalesce(minfo.title,'')), 'A')     || 
            setweight(to_tsvector('pg_catalog.english', coalesce(minfo.tags, '')), 'B')   ||
            setweight(to_tsvector('pg_catalog.english', coalesce(minfo.description,'')), 'C')
          from minfo where minfo.id = new."MerchantId";
        UPDATE "Merchants" SET textsearch = ts WHERE id = new."MerchantId";
        return new;
        end;
      $$ LANGUAGE plpgsql;`
        , { transaction }
      );
      await queryInterface.sequelize.query(
        `CREATE TRIGGER textsearch_vector_merchant_tags_update BEFORE INSERT OR UPDATE ON "MerchantTags" FOR EACH ROW EXECUTE PROCEDURE textsearch_vector_merchant_tags_trigger();`
        , { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(`DROP TRIGGER textsearch_vector_merchant_tags_update ON "Merchants"`, { transaction });
      await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS textsearch_vector_merchant_tags_trigger()`, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
