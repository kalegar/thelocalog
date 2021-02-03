import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Tag, Merchant, Address, SocialMediaLink } from '../database/models';
import productRouter from './products.routes.js';
import merchantTagRouter from './merchants.tags.routes.js';
import merchantAddressRouter from './merchants.addresses.routes.js';
import merchantCategoryRouter from './merchants.categories.routes.js';
import merchantHoursRouter from './merchants.hours.routes.js';
import merchantSocialMediaRouter from './merchants.socialmedia.routes.js';
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
router.post("/", async (req, res) => {
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
        const {perpage,page,search,tags,categories} = req.query;

        let query = {attributes: ['id','title','website','description']}
        let includes = []

        query.offset = 0;
        query.limit = 2;

        if (perpage) {
            query.limit = perpage;
        }
        if (page) {
            query.offset = query.limit * (page-1);
        }

        if (search || tags || categories) {
            let searchArray = search ? "(\'" + search.split(" ").map((tag) => tag.toUpperCase()).join('\',\'') + "\')" : '';
            const tagArray = tags ? "(\'" + tags.split(" ").map((tag) => tag.toUpperCase()).join('\',\'') + "\')" : '';
            const categoryArray = categories ? "(\'" + categories.split("+").map((tag) => tag.toUpperCase()).join('\',\'') + "\')" : '';
            let count = 0;
            const filterTags = 
                "m.id in ("+ //Filter Tags
                "SELECT mt.\"MerchantId\" as id "+
                "FROM \"MerchantTags\" mt join \"Tags\" t on mt.\"TagId\" = t.id " +
                "WHERE t.tag in " + tagArray + ")"
            const filterCategories = 
                "m.id in ("+ //Categories
                "SELECT mc.\"MerchantId\" as id "+
                "FROM \"MerchantCategories\" mc join \"Categories\" c on mc.\"CategoryId\" = c.id " +
                "WHERE c.category in " + categoryArray + ")"
            const filterSearch = 
                "(m.id in ("+ //Tags
                    "SELECT mt.\"MerchantId\" as id "+
                    "FROM \"MerchantTags\" mt join \"Tags\" t on mt.\"TagId\" = t.id " +
                    "WHERE t.tag in " + searchArray + ") " +
                "OR m.id in ("+ //Categories
                    "SELECT mc.\"MerchantId\" as id "+
                    "FROM \"MerchantCategories\" mc join \"Categories\" c on mc.\"CategoryId\" = c.id " +
                    "WHERE c.category in " + searchArray + ") " +
                "OR m.title iLike '%" + search + "%')";
            let q = "1=1 AND 2=2 AND 3=3";
            if (search)     q = q.replace("1=1",filterSearch);
            if (tags)       q = q.replace("2=2",filterTags);
            if (categories) q = q.replace("3=3",filterCategories);
            const countQuery = 
                "SELECT COUNT(m.id) " +
                "FROM \"Merchants\" m "+
                "WHERE " + q + ";";
            const selectQuery =
                "SELECT m.id,m.title,m.description,m.website " +
                "FROM \"Merchants\" m "+
                "WHERE " + q + 
                " LIMIT "+query.limit+" OFFSET "+query.offset+";";

            Merchant.sequelize.query(
                countQuery,
                { type: QueryTypes.SELECT, raw: true }
            ).then(result => {
                if (result && Array.isArray(result) && result.length > 0) {
                    count = Number(result[0].count);
                }
                if (count > 0) {
                    Merchant.sequelize.query(
                        selectQuery,
                        {
                            model: Merchant,
                            mapToModel: true
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
            where: { id: req.params.id }
        }

        if (!details) {
            query.attributes = ['id','title']
        }

        let includes = []

        if (include && include.toLowerCase().indexOf("address") >= 0) {
            includes.push( { model: Address, through: { attributes: [] } } );
        }

        if (include && include.toLowerCase().indexOf("tags") >= 0) {
            includes.push( { model: Tag, attributes: ['tag'], through: { attributes: [] } } );
        }

        if (include && include.toLowerCase().indexOf("social") >= 0) {
            includes.push( { model: SocialMediaLink });
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
router.put("/:id", async (req, res) => {
    try {
        const { title, description, website } = req.body;

        const merchants = await Merchant.update(
        { title, description, website },
        {
            returning: true,
            where: { id: req.params.id }
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
router.delete("/:id", async (req, res) => {
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

export default router;