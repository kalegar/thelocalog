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
import { Utils } from '../util.js';
import { Op, QueryTypes } from 'sequelize';

const handleValidationErrors = function(error,res) {
    if (error.name.includes('Validation')) {
        res.status(400).json({ message: error.message });
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

// Retrieve all merchants
router.get("/", async (req, res) => {
    try {
        const {perpage,page,search,tags,categories,neighbourhood,lat,lon,radius,deleted} = req.query;

        console.log(deleted);

        let query = {attributes: ['id','title','website','description']}
        let includes = []

        query.offset = 0;
        query.limit = 2;

        if (perpage) {
            query.limit = Utils.clamp(perpage,0,50);
        }
        if (page) {
            query.offset = Math.max(0,query.limit * (page-1));
        }

        const sortByDistance = (lat && lon);

        if (search || tags || categories || neighbourhood || sortByDistance) {
            let searchArray = search ? "(\'" + search.split(" ").map((tag) => tag.toUpperCase()).join('\',\'') + "\')" : '';
            const tagArray = tags ? "(\'" + tags.split(" ").map((tag) => tag.toUpperCase()).join('\',\'') + "\')" : '';
            const categoryArray = categories ? "(\'" + categories.split("+").map((tag) => tag.toUpperCase()).join('\',\'') + "\')" : '';
            let count = 0;
            const filterNearby =
                "m.id in ("+ //Filter Nearby
                "SELECT ma.\"MerchantId\" as id "+
                "FROM \"MerchantAddresses\" ma join \"Addresses\" a on ma.\"AddressId\" = a.id "+
                "WHERE ST_DWithin(a.geom, ST_MakePoint(:lat, :lon)::geography, :radius) )";
            const filterTags = 
                "m.id in ("+ //Filter Tags
                "SELECT mt.\"MerchantId\" as id "+
                "FROM \"MerchantTags\" mt join \"Tags\" t on mt.\"TagId\" = t.id " +
                "WHERE t.tag in " + tagArray + ")";
            const filterCategories = 
                "m.id in ("+ //Categories
                "SELECT mc.\"MerchantId\" as id "+
                "FROM \"MerchantCategories\" mc join \"Categories\" c on mc.\"CategoryId\" = c.id " +
                "WHERE c.category in " + categoryArray + ")";
            const filterNeighbourhood = 
                "m.id in ("+ //Neighbourhood
                "SELECT ma.\"MerchantId\" as id "+
                "FROM \"MerchantAddresses\" ma join \"Addresses\" a on ma.\"AddressId\" = a.id " +
                "WHERE a.neighbourhood iLike '%" + neighbourhood + "%')";    
            const filterSearch = 
                "(m.id in ("+ //Tags
                    "SELECT mt.\"MerchantId\" as id "+
                    "FROM \"MerchantTags\" mt join \"Tags\" t on mt.\"TagId\" = t.id " +
                    "WHERE t.tag in " + searchArray + ") " +
                "OR m.id in ("+ //Categories
                    "SELECT mc.\"MerchantId\" as id "+
                    "FROM \"MerchantCategories\" mc join \"Categories\" c on mc.\"CategoryId\" = c.id " +
                    "WHERE c.category in " + searchArray + ") " +
                "OR m.id in ("+ //Neighbourhood
                    "SELECT ma.\"MerchantId\" as id "+
                    "FROM \"MerchantAddresses\" ma join \"Addresses\" a on ma.\"AddressId\" = a.id " +
                    "WHERE a.neighbourhood iLike '%" + search + "%') " +
                "OR m.title iLike '%" + search + "%')";
            let q = "1=1 AND 2=2 AND 3=3 AND 4=4 AND 5=5";
            let replacements = {};
            if (search)            q = q.replace("1=1",filterSearch);
            if (tags)              q = q.replace("2=2",filterTags);
            if (categories)        q = q.replace("3=3",filterCategories);
            if (neighbourhood)     q = q.replace("4=4",filterNeighbourhood);
            if (deleted !== true)  q = q.replace("5=5","(m.\"deletedAt\" is NULL)");
            let countQuery = '';
            if (sortByDistance) {
                replacements.lat = lat;
                replacements.lon = lon,
                replacements.radius = radius ? Utils.clamp(radius,1000,100000) : 10000;
                
                countQuery = 
                "SELECT COUNT(m.id) " +
                "FROM ("+
                " SELECT DISTINCT ma.\"MerchantId\" as id, ST_Distance(geom, ref_geom) AS distance "+
                " FROM \"MerchantAddresses\" ma JOIN "+
                " \"Addresses\" a on ma.\"AddressId\" = a.id CROSS JOIN "+
                " (SELECT ST_MakePoint(:lat,:lon)::geography as ref_geom) AS r "+
                " WHERE ST_DWithin(a.geom, ref_geom, :radius) ) as d "+
                "JOIN \"Merchants\" m on d.id = m.id "+
                "WHERE " + q + ";";
            } else {
                countQuery = 
                "SELECT COUNT(m.id) " +
                "FROM \"Merchants\" m "+
                "WHERE " + q + ";";
            }
            
            Merchant.sequelize.query(
                countQuery,
                { type: QueryTypes.SELECT, raw: true, replacements }
            ).then(result => {
                if (result && Array.isArray(result) && result.length > 0) {
                    count = Number(result[0].count);
                }
                if (count > 0) {
                    if (query.offset > count) {
                        query.offset = 0;
                    }
                    let selectQuery = '';
                    if (sortByDistance) {
                        selectQuery = 
                        "SELECT m.id,m.title,m.description,m.website " +
                        "FROM ("+
                        " SELECT DISTINCT ma.\"MerchantId\" as id, ST_Distance(geom, ref_geom) AS distance "+
                        " FROM \"MerchantAddresses\" ma JOIN "+
                        " \"Addresses\" a on ma.\"AddressId\" = a.id CROSS JOIN "+
                        " (SELECT ST_MakePoint(:lat,:lon)::geography as ref_geom) AS r "+
                        " WHERE ST_DWithin(a.geom, ref_geom, :radius) ) as d "+
                        "JOIN \"Merchants\" m on d.id = m.id "+
                        "WHERE " + q +
                        " ORDER BY d.distance " +
                        " LIMIT "+query.limit+" OFFSET "+query.offset+";";
                    } else {
                        selectQuery =
                        "SELECT m.id,m.title,m.description,m.website " +
                        "FROM \"Merchants\" m "+
                        "WHERE " + q +
                        " ORDER BY m.title ASC" + 
                        " LIMIT "+query.limit+" OFFSET "+query.offset+";";
                    }
                    Merchant.sequelize.query(
                        selectQuery,
                        {
                            model: Merchant,
                            mapToModel: true,
                            replacements
                        }
                    ).then(merchants => {
                        return res.status(200).json({ merchants: { count, rows: merchants }});
                    })
                } else {
                    return res.status(200).json({ merchants: { count, rows: [] }});
                }
            });
            return;
        }

        if (includes.length > 0) {
            query.include = includes;
        }

        query.order = [ ['title','ASC'] ];

        if (deleted) {
            query.paranoid = false;
        }

        const merchants = await Merchant.findAndCountAll(query);

        return res.status(200).json({ merchants });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.status(500).json({ message: error.message });
    }
});

// Update a merchant by id
router.put("/:id", checkJwt, adminRole, async (req, res) => {
    try {
        const { title, description, website, deletedAt } = req.body;

        const merchants = await Merchant.update(
        { title, description, website, deletedAt },
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
        res.status(500).json({ message: error.message });
    }
});

// Delete a merchant by id
router.delete("/:id", checkJwt, adminRole, async (req, res) => {
    try {
        const merchant = await Merchant.destroy({ where: { id: req.params.id } });
        if (!merchant)
            return res.status(404).json({ message: 'The merchant with the given id was not found' });
    
        return res.status(200).json({ message: 'The merchant was deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
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