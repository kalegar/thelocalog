import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, User, sequelize } from '../database/models';
import { QueryTypes } from 'sequelize';
import jwtAuthz from 'express-jwt-authz';
import * as authService from '../service/auth0.service.js';


const router = Router({mergeParams: true});

router.get('/', async (req, res) => {
    try {
        
        const userId = req.user.sub;
        
        const [user, created] = await User.findOrCreate({
            where: { id: userId },
            defaults: {
                id: userId
            }
        });

        if (created) {
            return res.status(201).json({ message: 'New user created.'});
        }else{
            return res.status(200).json({ message: 'Welcome user!'});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/profile', async (req, res) => {
    try {
        const userId = req.user.sub;
        const {name, email, picture} = req.body;

        const body = {};
        if (name) {
            body.name = name;
        }
        if (email) {
            body.email = email;
        }
        if (picture) {
            body.picture = picture;
        }
        const result = await authService.updateUserProfile(userId,body);
        return res.status(result.status).json(result.data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/merchants', async (req, res) => {
    try {
        const userId = req.user.sub;
        const sql = 
                "SELECT m.id,m.title,m.description,m.website " +
                "FROM \"Merchants\" m "+
                "JOIN \"MerchantOwners\" mo ON mo.\"MerchantId\" = m.id " +
                "WHERE mo.\"UserId\" = :userId";

        const merchants = await sequelize.query(sql,
        {
            replacements: {
                userId
            },
            type: QueryTypes.SELECT
        });

        if (merchants) {
            return res.status(200).json({merchants});
        }else{
            return res.status(200).json([]);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/* Method to determine if the requesting user is the owner of the specified merchant Id. */
router.get('/merchants/:merchantId', async (req, res) => {
    try {
        const userId = req.user.sub;
        const sql = 
                "SELECT m.id,m.title,m.description,m.website " +
                "FROM \"Merchants\" m "+
                "JOIN \"MerchantOwners\" mo ON mo.\"MerchantId\" = m.id " +
                "WHERE mo.\"UserId\" = :userId AND mo.\"MerchantId\" = :merchantId";

        const merchants = await sequelize.query(sql,
        {
            replacements: {
                userId,
                merchantId: req.params.merchantId
            },
            type: QueryTypes.SELECT
        });

        if (merchants && merchants.length) {
            return res.status(200).json(merchants);
        } else {
            return res.status(200).json([]);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const addOwnerScope = jwtAuthz([ 'create:my-merchants' ]);
router.post('/merchants', addOwnerScope, async (req, res) => {
    try {
        const { userId, merchantId } = req.body;

        const updatedAt = new Date();
        const createdAt = updatedAt;

        const sql = 
            "INSERT INTO \"MerchantOwners\" (\"MerchantId\",\"UserId\",\"updatedAt\",\"createdAt\") VALUES (:merchantId, :userId, :updatedAt, :createdAt)"

        const result = await sequelize.query(sql,
            {
                replacements: {
                    merchantId,
                    userId,
                    updatedAt,
                    createdAt
            },
            type: QueryTypes.INSERT
        });
       
        return res.status(201).json({ message: 'Success.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
 });


export default router;