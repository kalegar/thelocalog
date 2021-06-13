'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query('ALTER TABLE "Merchants" ADD COLUMN textsearch TSVECTOR', { transaction });
      await queryInterface.sequelize.query(
        `WITH mtags (id, tags) AS (
          SELECT m."MerchantId" AS id, string_agg(t.tag,' ') AS tags from "Tags" t join "MerchantTags" m on t.id = m."TagId" group by m."MerchantId"
        )
        UPDATE "Merchants" AS mm SET textsearch = (
        SELECT
          setweight(to_tsvector('pg_catalog.english', coalesce(m.title,'')), 'A')       || 
          setweight(to_tsvector('pg_catalog.english', coalesce(mtags.tags, '')), 'B')   ||
          setweight(to_tsvector('pg_catalog.english', coalesce(m.description,'')), 'C')
        from "Merchants" m join mtags on m.id = mtags.id and m.id = mm.id
        )`
        , { transaction }
      );
      await queryInterface.sequelize.query(
        `CREATE INDEX textsearch_vector_idx ON "Merchants" USING gin("textsearch");`
        , { transaction }
      );
      await queryInterface.sequelize.query(
        `CREATE FUNCTION textsearch_vector_trigger() RETURNS trigger AS $$
        DECLARE ts TSVECTOR; 
        begin
          WITH mtags (id, tags) AS (
            SELECT m."MerchantId" AS id, string_agg(t.tag,' ') AS tags from "Tags" t join "MerchantTags" m on t.id = m."TagId" group by m."MerchantId"
          )
        SELECT INTO ts
            setweight(to_tsvector('pg_catalog.english', coalesce(new.title,'')), 'A')       || 
            setweight(to_tsvector('pg_catalog.english', coalesce(mtags.tags, '')), 'B')   ||
            setweight(to_tsvector('pg_catalog.english', coalesce(new.description,'')), 'C')
          from mtags where mtags.id = new.id;
        new.textsearch := ts;
          return new;
        end;
      $$ LANGUAGE plpgsql;`
        , { transaction }
      );
      await queryInterface.sequelize.query(
        `CREATE TRIGGER textsearch_vector_update BEFORE INSERT OR UPDATE ON "Merchants" FOR EACH ROW EXECUTE PROCEDURE textsearch_vector_trigger();`
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
      await queryInterface.sequelize.query(`DROP TRIGGER textsearch_vector_update ON "Merchants"`, { transaction });
      await queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS textsearch_vector_trigger()`, { transaction });
      await queryInterface.sequelize.query(`DROP INDEX textsearch_vector_idx`, { transaction });
      await queryInterface.removeColumn('Merchants','textsearch', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
