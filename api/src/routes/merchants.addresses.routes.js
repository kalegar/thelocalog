import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Address } from '../database/models';

const router = Router({mergeParams: true});

// Create a new Merchant Address
router.post("/", async (req, res) => {
    try {
        const merchantId = req.params.merchantId;
        const { address, city, province, country, postalcode } = req.body;

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
        const newAddress = await Address.create({
            address1,
            address2,
            address3,
            city,
            province,
            country,
            postalcode
        });
        merchant.addAddress(newAddress).then(() => {
            return res.status(201).json({ merchant, newAddress });
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
        console.log(addresses);
        return res.status(200).json({ addresses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an address by id
router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
    try {
        const address = await Address.destroy({ where: { id: req.params.id } });
        if (!address)
            return res.status(404).json({ message: 'The address with the given id was not found' });
    
        return res.status(200).json({ message: 'The address was deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;