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
import redisService, { redisClient, redisPrefixRequest, redisExpiryTimeShort } from '../service/redis.service.js';
import { GoogleAPIService } from "../service/google-api.service";
import { LoggingService } from "../service/logging.service";

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
        const {perpage,page,s: search,t: tags,c: categories,n: neighbourhood,lat,lon,radius,deleted,sort,o: onlineShopping} = req.query;

        let query = {attributes: ['id','title','website','description']}

        query.offset = 0;
        query.limit = 2;

        if (perpage) {
            query.limit = Utils.clamp(perpage,0,50);
        }
        if (page) {
            query.offset = Math.max(0,query.limit * (page-1));
        }

        const sortByDistance = (lat && lon);

        if (search || tags || categories || neighbourhood || sortByDistance || onlineShopping) {
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
                "OR (query @@ m.textsearch))";
            const filterOnlineShopping =
                "(m.\"onlineShopping\" = :onlineShopping)";
            
            let q = "1=1 AND 2=2 AND 3=3 AND 4=4 AND 5=5 AND 6=6";
            let replacements = {};

            let selectClause = "m.id,m.title,m.description,m.website";
            let orderByClause = "m.title ASC";
            let limitClause = " LIMIT "+query.limit+" OFFSET "+query.offset+";";
            let mainQuery = "\"Merchants\" m";

            let allowedOrderBy = {
                'TITLE': 'm.title'
            };

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

            if (deleted !== true)  q = q.replace("5=5","(m.\"deletedAt\" is NULL)");

            if (typeof onlineShopping !== 'undefined') {
                q = q.replace("6=6",filterOnlineShopping);
                replacements.onlineShopping = (onlineShopping == 1);
            }

            /////////////////////
            //START BUILD QUERY//
            /////////////////////
            if (search && sortByDistance) {
                selectClause = 
                "m.id,m.title,m.description,m.website,ts_rank_cd('{0.1, 0.3, 0.6, 1.0}', m.textsearch, query) as rank, d.distance";

                mainQuery =
                "("+
                " SELECT ma.\"MerchantId\" as id, MIN(ST_Distance(geom, ref_geom)) AS distance "+
                " FROM \"MerchantAddresses\" ma JOIN "+
                " \"Addresses\" a on ma.\"AddressId\" = a.id CROSS JOIN "+
                " (SELECT ST_MakePoint(:lon,:lat)::geography as ref_geom) AS r "+
                " WHERE ST_DWithin(a.geom, ref_geom, :radius) "+
                " GROUP BY ma.\"MerchantId\"" + 
                ") as d "+
                "JOIN \"Merchants\" m on d.id = m.id, websearch_to_tsquery(:search) as query";

                orderByClause = "rank DESC, d.distance";
            } else if (search) {
                selectClause = 
                "m.id,m.title,m.description,m.website,ts_rank_cd('{0.1, 0.3, 0.6, 1.0}', m.textsearch, query) as rank";
                mainQuery = 
                "\"Merchants\" m, websearch_to_tsquery(:search) as query ";

                orderByClause = "rank DESC";

            } else if (sortByDistance) {
                selectClause =
                "m.id,m.title,m.description,m.website,distance";
                mainQuery =
                "("+
                " SELECT ma.\"MerchantId\" as id, MIN(ST_Distance(geom, ref_geom)) AS distance "+
                " FROM \"MerchantAddresses\" ma JOIN "+
                " \"Addresses\" a on ma.\"AddressId\" = a.id CROSS JOIN "+
                " (SELECT ST_MakePoint(:lon,:lat)::geography as ref_geom) AS r "+
                " WHERE ST_DWithin(a.geom, ref_geom, :radius) "+
                " GROUP BY ma.\"MerchantId\"" + 
                ") as d "+
                "JOIN \"Merchants\" m on d.id = m.id ";

                orderByClause = "d.distance";
            }

            if (sort) {
                orderByClause = parseSort(sort,allowedOrderBy);
            }

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
            
            const countResult = await Merchant.sequelize.query(
                countQuery,
                { type: QueryTypes.SELECT, raw: true, replacements }
            );
            let count = 0;
            if (countResult && Array.isArray(countResult) && countResult.length > 0) {
                count = Number(countResult[0].count);
            }
            if (count > 0) {
                if (query.offset > count) {
                    query.offset = 0;
                }
                const merchants = await Merchant.sequelize.query(
                    selectQuery,
                    {
                        model: Merchant,
                        mapToModel: true,
                        replacements
                    }
                );
                return res.status(200).json({ merchants: { count, rows: merchants }});
            } else {
                return res.status(200).json({ merchants: { count, rows: [] }});
            }
        }

        query.order = [ ['title','ASC'] ];

        if (deleted) {
            query.paranoid = false;
        }

        const queryStr = JSON.stringify(query);
        redisClient.get(`${redisPrefixRequest}${queryStr}`, async function(err, reply) {
            if (err || !reply) {
                const merchants = await Merchant.findAndCountAll(query);
                redisClient.setex(`${redisPrefixRequest}${queryStr}`,redisExpiryTimeShort,JSON.stringify(merchants));
                res.set('Cache-Control', `public, max-age=${redisExpiryTimeShort}`);
                return res.status(200).json({ merchants });
            }
            res.set('Cache-Control', `public, max-age=${redisExpiryTimeShort}`);
            const data = JSON.parse(reply);
            return res.status(200).json({ merchants: data });
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

const getFullAddress = function(addrObject) {
    return addrObject.address1 && addrObject.address1.length > 0 ? addrObject.address1 + ', ' : '' +
           addrObject.address2 && addrObject.address2.length > 0 ? addrObject.address2 + ', ' : '' +
           addrObject.address3 && addrObject.address3.length > 0 ? addrObject.address3 + ', ' : '' +
           addrObject.city     && addrObject.city.length     > 0 ? addrObject.city     + ', ' : '' +
           addrObject.province && addrObject.province.length > 0 ? addrObject.province : '';
}

const areAddressesEqual = function(addr1, addr2) {
    return (
           addr1.address1      === addr2.address1   &&
           addr1.address2      === addr2.address2   &&
           addr1.address3      === addr2.address3   &&
           addr1.city          === addr2.city       &&
           addr1.province      === addr2.province   &&
           addr1.country       === addr2.country    &&
           addr1.postalcode    === addr2.postalcode &&
           addr1.neighbourhood === addr2.neighbourhood
    );
}

const areContactsEqual = function(cont1, cont2) {
    return (
            cont1.email      === cont2.email     &&
            cont1.email2     === cont2.email2    &&
            cont1.phone      === cont2.phone     &&
            cont1.phonetype  === cont2.phonetype &&
            cont1.phone2     === cont2.phone2    &&
            cont1.phonetype2 === cont2.phonetype2
    );
}

// Update a merchant by id
router.put("/:id", checkJwt, adminRole, async (req, res) => {
    try {
        const { title, description, website, deletedAt, onlineShopping, inStoreShopping, Addresses } = req.body;

        let updatedMerchant = {
            title, description, website, deletedAt, onlineShopping, inStoreShopping
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

        if (Addresses && Array.isArray(Addresses)) {
            Merchant.findOne({where: {id: req.params.id }, include: { model: Address, include: { model: Contact}}}).then((merch) => {
                const currentAddresses = merch.Addresses;
                if (typeof currentAddresses !== 'undefined' || currentAddresses.length > 0) {
                for (const address of Addresses) {
                    let temp = currentAddresses.filter(addr => addr.id = address.id);
                    if (temp.length <= 0) {
                        LoggingService.log('Tried to update an address for a different merchant!!');
                        continue;
                    }

                    const currAddr = temp[0];

                    if (areAddressesEqual(address,currAddr)) {
                        if ((address.hasOwnProperty('Contact')) && areContactsEqual(address.Contact,currAddr.Contact)) {
                            LoggingService.log('Address unchanged. skipping.');
                            continue;
                        }
                    }
    
                    let newAddress = {
                        address1: address.address1,
                        address2: address.address2,
                        address3: address.address3,
                        city: address.city,
                        province: address.province,
                        postalcode: address.postalcode,
                        neighbourhood: address.neighbourhood,
                        full: getFullAddress(address),
                    }
        
                    GoogleAPIService.getPlace(title, address).then(function(place) {
                        if (place) {
                            newAddress.placeid = place.place_id;
                            if (place.geometry && place.geometry.location) {
                                newAddress.geom = Utils.createGeom(place.geometry.location.lng,place.geometry.location.lat);
                            }
                        } else {
                            newAddress.placeid = null;
                            newAddress.geom = null;
                        }
                    }).catch((err) => console.log(err)).then(() => {
                        Address.update(
                            newAddress,
                            {
                                returning: false,
                                where: { id : address.id }
                            }
                        )
        
                        if (address.Contact) {
                            Contact.update(
                                {
                                email: address.Contact.email,
                                email2: address.Contact.email2,
                                phone: address.Contact.phone,
                                phone2: address.Contact.phone2
                                },
                                {
                                    returning: false,
                                    where: { id : address.Contact.id }
                                }
                            )
                        }
                    })
                    
                }
                }else{
                    LoggingService.log('No addresses on current merchant. Aborting address updates.');
                }
            }).catch((err) => console.log(err));
        }

        return res.status(200).json({ merchant });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
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