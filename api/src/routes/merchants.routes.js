import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Tag, Category, Merchant, Address, Contact, SocialMediaLink, sequelize } from '../database/models';
import productRouter from './products.routes.js';
import merchantTagRouter from './merchants.tags.routes.js';
import merchantAddressRouter from './merchants.addresses.routes.js';
import merchantCategoryRouter from './merchants.categories.routes.js';
import merchantHoursRouter from './merchants.hours.routes.js';
import merchantSocialMediaRouter from './merchants.socialmedia.routes.js';
import merchantImagesRouter from './merchants.images.routes.js';
import merchantClaimsRouter from './merchants.claims.routes.js';
import checkJwt from '../middleware/authentication.js';
import adminRole from '../middleware/admin.auth.js';
import userOwnsMerchant from '../middleware/merchantOwner.middleware.js';
import { Utils } from '../util.js';
import { Op, QueryTypes } from 'sequelize';
import { redisClient, redisPrefixRequest, redisExpiryTimeShort } from '../service/redis.service.js';
import crypto from 'crypto';

const handleValidationErrors = function(error,res) {
    if (error.name.includes('Validation')) {
        res.status(403).json({ message: error.message });
    }else{
        res.status(500).json({ message: error.message });
    }
}

const router = Router();

// Create a new Merchant
router.post("/", checkJwt, adminRole, async (req, res) => {
    try {
        const { title, description, website } = req.body;
        const merchant = await Merchant.create({title,description,website});

        const tags = title.split(" ");
        tags.map(t => {
            Tag.findOrCreate({
                where: { tag: t.toUpperCase() },
                defaults: { tag: t }
            }).then(tag => {
                tag[0].addMerchant(merchant);
            })
        });

        return res.status(201).json({ merchant });
    } catch (error) {
        handleValidationErrors(error,res);
    }
});

const parseSort = function(value,allowed) {
    let result = '';
    if (value && allowed) {
        const arr = Array.isArray(value) ? value : value.split(',');
        arr.map(e => {
            if (e && e.length > 1) {
                const dir = e.charAt(0);
                const col = ((dir === '+' || dir === '-') ? e.slice(1) : e).toUpperCase();
                if (allowed.hasOwnProperty(col)) {
                    if (result !== '') {
                        result = result + ', ';
                    }
                    if (dir === '-') {
                        result = result + allowed[col] + ' ' + 'DESC';
                    } else {
                        result = result + allowed[col] + ' ' + 'ASC';
                    }
                }
            }
        })
    }
    return result;
}

// Retrieve all merchants
router.get("/", async (req, res) => {
    try {
        const {perpage,page,s: search,t: tags,c: categories,n: neighbourhood,lat,lon,radius,deleted,sort,o: onlineShopping, franchise, independent, canadian} = req.query;

        let query = {attributes: ['id','title','website','description']}

        query.offset = 0;
        query.limit = 2;

        if (perpage) {
            query.limit = Utils.clamp(perpage,0,50);
        }
        if (page) {
            query.offset = Math.max(0,query.limit * (page-1));
        }

        let selectClause = "m.id,m.title,m.description,m.website, a.geom as location";
        let orderByClause = "m.title ASC";
        let limitClause = " LIMIT :perpage OFFSET :page;";
        let mainQuery = "\"Merchants\" m left outer join \"MerchantAddresses\" ma on m.id = ma.\"MerchantId\" left outer join \"Addresses\" a on ma.\"AddressId\" = a.id";

        let q = "1=1 AND 2=2 AND 3=3 AND 4=4 AND 5=5 AND 6=6 AND 7=7 AND 8=8 AND 9=9";
        let replacements = {perpage: query.limit, page: query.offset};

        let allowedOrderBy = {
            'TITLE': 'm.title'
        };

        const sortByDistance = (lat && lon);

        if (search || tags || categories || neighbourhood || sortByDistance || onlineShopping || franchise || independent || canadian) {
            const searchArray        = Utils.toListSQL(search,true,' ');
            const tagArray           = Utils.toListSQL(tags);
            const categoryArray      = Utils.toListSQL(categories);
            const neighbourhoodArray = Utils.toListSQL(neighbourhood);
            
            const filterTags = 
                "m.id in ("+ //Filter Tags
                "SELECT mt.\"MerchantId\" as id "+
                "FROM \"MerchantTags\" mt join \"Tags\" t on mt.\"TagId\" = t.id " +
                `WHERE t.tag in ${tagArray})`;
            const filterCategories = 
                "m.id in ("+ //Categories
                "SELECT mc.\"MerchantId\" as id "+
                "FROM \"MerchantCategories\" mc join \"Categories\" c on mc.\"CategoryId\" = c.id " +
                `WHERE c.category in ${categoryArray})`;
            const filterNeighbourhood = 
                "m.id in ("+ //Neighbourhood
                "SELECT ma.\"MerchantId\" as id "+
                "FROM \"MerchantAddresses\" ma join \"Addresses\" a on ma.\"AddressId\" = a.id " +
                `WHERE UPPER(a.neighbourhood) iLike :neighbourhoodlike OR UPPER(a.neighbourhood) in ${neighbourhoodArray})`;    
            const filterSearch = 
                "(m.id in ("+ //Categories
                    "SELECT mc.\"MerchantId\" as id "+
                    "FROM \"MerchantCategories\" mc join \"Categories\" c on mc.\"CategoryId\" = c.id " +
                    `WHERE c.category in ${searchArray}) ` +
                "OR m.id in ("+ //Neighbourhood
                    "SELECT ma.\"MerchantId\" as id "+
                    "FROM \"MerchantAddresses\" ma join \"Addresses\" a on ma.\"AddressId\" = a.id " +
                    `WHERE a.neighbourhood iLike :searchlike OR UPPER(a.neighbourhood) in ${searchArray}) ` +
                "OR m.title iLike :searchlike " +
                "OR (query @@ m.textsearch) " +
                "OR (query2 @@ m.textsearch))";
            const filterOnlineShopping =
                "(m.\"onlineShopping\" = :onlineShopping)";
            const filterFranchise =
                "(m.\"franchise\" = :franchise)";
            const independentFilter = 
                "(m.\"independent\" = :independent)";
            const canadianOwnedFilter = 
                "(m.\"canadianOwned\" = :canadianOwned)";

            if (sortByDistance) {
                replacements.lat = lat;
                replacements.lon = lon;
                replacements.radius = radius ? Utils.clamp(radius,1,100000) : 10000;
                allowedOrderBy['DIST'] = 'd.distance';
            }
            if (search) {
                q = q.replace('1=1',filterSearch);
                replacements.search = search;
                replacements.searchlike = '%' + search + '%';
                replacements.fallbacksearch = search.split(' ').join(' | ');
                allowedOrderBy['RANK'] = 'rank';
            }
            if (tags) {
                q = q.replace("2=2",filterTags);
            }
            if (categories) {
                q = q.replace("3=3",filterCategories);
            }
            if (neighbourhood) {
                q = q.replace("4=4",filterNeighbourhood);
                replacements.neighbourhoodlike = '%' + neighbourhood + '%';
            }

            if (typeof onlineShopping !== 'undefined') {
                q = q.replace("6=6",filterOnlineShopping);
                replacements.onlineShopping = (onlineShopping == 1) || (onlineShopping === 'true');
            }

            if (typeof franchise !== 'undefined') {
                q = q.replace("7=7", filterFranchise);
                replacements.franchise = (franchise == 1) || (franchise === 'true');
            }

            if (typeof independent !== 'undefined') {
                q = q.replace("8=8", independentFilter);
                replacements.independent = (independent == 1) || (independent === 'true');
            }

            if (typeof canadian !== 'undefined') {
                q = q.replace("9=9", canadianOwnedFilter);
                replacements.canadianOwned = (canadian == 1) || (canadian === 'true');
            }

            
            if (search && sortByDistance) {
                selectClause = 
                "m.id,m.title,m.description,m.website,greatest(ts_rank_cd('{0.1, 0.3, 0.6, 1.0}', m.textsearch, query),ts_rank_cd('{0.1, 0.3, 0.6, 1.0}', m.textsearch, query2)) as rank, d.distance, d.location";

                mainQuery =
                "("+
                " SELECT ma.\"MerchantId\" as id, ST_Distance(geom, ref_geom) AS distance, geom as location  "+
                " FROM \"MerchantAddresses\" ma JOIN "+
                " \"Addresses\" a on ma.\"AddressId\" = a.id CROSS JOIN "+
                " (SELECT ST_MakePoint(:lon,:lat)::geography as ref_geom) AS r "+
                " WHERE ST_DWithin(a.geom, ref_geom, :radius) "+
                " ORDER BY distance ASC " + 
                ") as d "+
                "JOIN \"Merchants\" m on d.id = m.id, websearch_to_tsquery(:search) as query, to_tsquery(:fallbacksearch) as query2 ";

                orderByClause = "rank DESC, d.distance";
            } else if (search) {
                selectClause = 
                "m.id,m.title,m.description,m.website,greatest(ts_rank_cd('{0.1, 0.3, 0.6, 1.0}', m.textsearch, query),ts_rank_cd('{0.1, 0.3, 0.6, 1.0}', m.textsearch, query2)) as rank, a.geom as location";
                mainQuery = 
                "\"Merchants\" m join "+
                "\"MerchantAddresses\" ma on m.id = ma.\"MerchantId\" join "+
                "\"Addresses\" a on ma.\"AddressId\" = a.id, "+
                "websearch_to_tsquery(:search) as query, to_tsquery(:fallbacksearch) as query2 ";

                orderByClause = "rank DESC";

            } else if (sortByDistance) {
                selectClause =
                "m.id,m.title,m.description,m.website,distance,location";
                mainQuery =
                "("+
                " SELECT ma.\"MerchantId\" as id, ST_Distance(geom, ref_geom) AS distance, geom as location  "+
                " FROM \"MerchantAddresses\" ma JOIN "+
                " \"Addresses\" a on ma.\"AddressId\" = a.id CROSS JOIN "+
                " (SELECT ST_MakePoint(:lon,:lat)::geography as ref_geom) AS r "+
                " WHERE ST_DWithin(a.geom, ref_geom, :radius) "+
                " ORDER BY distance ASC " + 
                ") as d "+
                "JOIN \"Merchants\" m on d.id = m.id ";

                orderByClause = "d.distance";
            }

            if (sort) {
                orderByClause = parseSort(sort,allowedOrderBy);
            }
        }

        if (deleted !== 'true')  q = q.replace("5=5","(m.\"deletedAt\" is NULL)");

        /////////////////////
        //START BUILD QUERY//
        /////////////////////

        const countQuery = 
        "SELECT COUNT(m.id) " +
        "FROM " + mainQuery + " " +
        "WHERE " + q + ";"

        const selectQuery = 
        "SELECT " + selectClause + " " +
        "FROM " + mainQuery + " " +
        "WHERE " + q + " " +
        (orderByClause ? "ORDER BY " + orderByClause + " " : "") +
        (limitClause ? limitClause : "") +
        ";";
        ///////////////////
        //END BUILD QUERY//
        ///////////////////

        const hash = crypto.createHash('md5').update(`${selectQuery}_${JSON.stringify(replacements)}`).digest('hex');

        redisClient.get(`${redisPrefixRequest}${hash}`, async function(err, reply) {
            if (err || !reply) {

                const countResult = await Merchant.sequelize.query(
                    countQuery,
                    { type: QueryTypes.SELECT, raw: true, replacements }
                );
                let count = 0;
                if (countResult && Array.isArray(countResult) && countResult.length > 0) {
                    count = Number(countResult[0].count);
                }
                let merchants = [];
                if (count > 0) {
                    if (query.offset > count) {
                        query.offset = 0;
                    }
                    merchants = await Merchant.sequelize.query(
                        selectQuery,
                        {
                            model: Merchant,
                            mapToModel: true,
                            replacements
                        }
                    );
                    
                }
                const data = { merchants: { count, rows: merchants }, cached: false};
                redisClient.setex(`${redisPrefixRequest}${hash}`,redisExpiryTimeShort,JSON.stringify(data));
                res.set('Cache-Control', `public, max-age=${redisExpiryTimeShort}`);
                return res.status(200).json(data);
            }
            res.set('Cache-Control', `public, max-age=${redisExpiryTimeShort}`);
            const data = JSON.parse(reply);
            data.cached = true;
            return res.status(200).json(data);
        });
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Retrieve a single merchant by id
router.get("/:id", async (req, res) => {
    try {
        const {details,include} = req.query;

        let query = {
            where: { id: req.params.id },
            paranoid: false
        }

        if (!details) {
            query.attributes = ['id','title']
        }

        let includes = []

        if (include) {
            const term = include.toLowerCase();
            const all = term.indexOf("all") >= 0;
            if (all || term.indexOf("address") >= 0) {
                if (all || term.indexOf("contact") >= 0) {
                    includes.push( { model: Address, through: { attributes: [] }, include: { model: Contact } } );
                }else{
                    includes.push( { model: Address, through: { attributes: [] } } );
                }
            }
            if (all || term.indexOf("tags") >= 0) {
                includes.push( { model: Tag, attributes: ['tag'], through: { attributes: [] } } );
            }
            if (all || term.indexOf("social") >= 0) {
                includes.push( { model: SocialMediaLink });
            }
            if (all || term.indexOf("category") >= 0 || term.indexOf("categories") >= 0) {
                includes.push( { model: Category, through: { attributes: [] } } );
            }
        }

        if (includes.length > 0) {
            query.include = includes;
        }

        const merchant = await Merchant.findOne(query);

        if(!merchant) {
            return res.status(404).json({ message: 'the merchant with the given id was not found' });
        }

        return res.status(200).json({ merchant });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update a merchant by id
router.put("/:id", checkJwt, userOwnsMerchant, async (req, res) => {
    try {
        const { title, description, website, deletedAt, onlineShopping, inStoreShopping, franchise, independent, canadian } = req.body;

        let updatedMerchant = {
            title, description, website, deletedAt, onlineShopping, inStoreShopping, franchise, independent, canadian
        };

        const merchants = await Merchant.update(
        updatedMerchant,
        {
            returning: true,
            where: { id: req.params.id },
            paranoid: false
        }
        );
    
        if (merchants[0] === 0)
            return res.status(404).json({ message: 'The merchant with the given id was not found' });
        
        const merchant = merchants[1][0].dataValues;

        return res.status(200).json({ merchant });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete a merchant by id
router.delete("/:id", checkJwt, userOwnsMerchant, async (req, res) => {
    try {
        const merchant = await Merchant.destroy({ where: { id: req.params.id } });
        if (!merchant)
            return res.status(404).json({ message: 'The merchant with the given id was not found' });
    
        return res.status(200).json({ message: 'The merchant was deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.use('/:merchantId/products',productRouter);

router.use('/:merchantId/tags',merchantTagRouter);

router.use('/:merchantId/addresses',merchantAddressRouter);

router.use('/:merchantId/categories',merchantCategoryRouter);

router.use('/:merchantId/hours',merchantHoursRouter);

router.use('/:merchantId/socialmedia',merchantSocialMediaRouter);

router.use('/:merchantId/images',merchantImagesRouter);

//Merchant claims. Must be logged in.
router.use('/:merchantId/claims', checkJwt, merchantClaimsRouter);

export default router;