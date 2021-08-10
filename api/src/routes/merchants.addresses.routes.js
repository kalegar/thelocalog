import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Address } from '../database/models';
import checkJwt from '../middleware/authentication.js';
import adminRole from '../middleware/admin.auth.js';
import { Utils } from '../util.js';

const router = Router({mergeParams: true});

// Create a new Merchant Address
router.post("/", checkJwt, adminRole, async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const { address, city, province, country, postalcode, neighbourhood } = req.body;

        if (!address || !city || !province || !country || !postalcode) {
            return res.status(400).json({ message: 'address, province, country, and postalcode are required if specifying an address' });
        }

        let addressLines = address.split("\n");
        let address1 = addressLines[0];
        let address2 = addressLines.length > 1 ? addressLines[1] : '';
        let address3 = addressLines.length > 2 ? addressLines[2] : '';
  
        const merchant = await Merchant.findOne({
            where: {id : merchantId }
        });
        if (!merchant) {
            return res.status(404).json({ message: 'The merchant with the given id was not found.'});
        }

        let addrObj = {
            address1,
            address2,
            address3,
            city,
            province,
            country,
            postalcode,
            neighbourhood
        }
        const newAddress = await Address.create({
            address1,
            address2,
            address3,
            city,
            province,
            country,
            postalcode,
            neighbourhood,
            full: Utils.getFullAddress(addrObj)
        });
        merchant.addAddress(newAddress).then(() => {
            return res.status(201).json({ merchant, address: newAddress });
        }).catch((error) => {
            return res.status(500).json({ message: error });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Retrieve all addresses
router.get("/", async (req, res) => {
    try {
        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId }
        });
        const addresses = await merchant.getAddresses();
        return res.status(200).json({ addresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an address by id
router.put("/:id", checkJwt, adminRole, async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const { address, city, province, country, postalcode } = req.body;

        let addressLines = address ? address.split("\n") : [];
        let address1 = addressLines.length > 0 ? addressLines[0] : '';
        let address2 = addressLines.length > 1 ? addressLines[1] : '';
        let address3 = addressLines.length > 2 ? addressLines[2] : '';

        const addresses = await Address.update(
        {  address1,
            address2,
            address3,
            city,
            province,
            country,
            postalcode
        },
        {
            returning: true,
            where: { id: req.params.id }
        }
        );
    
        if (addresses[0] === 0)
            return res.status(404).json({ message: 'The address with the given id was not found' });
        
        const updatedAddress = addresses[1][0].dataValues;

        return res.status(200).json({ updatedAddress });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete an address by id
router.delete("/:id", checkJwt, adminRole, async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const merchant = await Merchant.findOne({ where: {id: merchantId}, include: {model: Address, where: {id: req.params.id}}});
        if (merchant && merchant.Addresses && Array.isArray(merchant.Addresses)) {
            const address = await Address.destroy({ where: { id: req.params.id } });
            if (!address)
                return res.status(404).json({ message: 'The address with the given id was not found' });
            return res.status(200).json({ message: 'The address was deleted successfully' });
        }
        return res.status(404).json({ message: 'The address with the given id is not associated with the given merchant.'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;