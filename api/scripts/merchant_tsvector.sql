WITH mtags (id, tags) AS (
	SELECT m."MerchantId" AS id, string_agg(t.tag,' ') AS tags from "Tags" t join "MerchantTags" m on t.id = m."TagId" group by m."MerchantId"
)
UPDATE "Merchants" AS mm SET textsearch = (
SELECT
  setweight(to_tsvector(coalesce(nullif(m.title,''))), 'A')       || 
  setweight(to_tsvector(coalesce(nullif(mtags.tags, ''))), 'B')   ||
  setweight(to_tsvector(coalesce(nullif(m.description,''))), 'C')
from "Merchants" m join mtags on m.id = mtags.id and m.id = mm.id
)

