import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Merchant, Address, Contact } from '../database/models';
import checkJwt from '../middleware/authentication.js';
import ownsMerchant from '../middleware/merchantOwner.middleware.js';
import { Utils } from '../util.js';
import { GoogleAPIService } from "../service/google-api.service";
import { LoggingService } from "../service/logging.service";

const router = Router({mergeParams: true});

// Create a new Merchant Address
router.post("/", checkJwt, ownsMerchant, async (req, res) => {
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
router.put("/:id", checkJwt, ownsMerchant, async (req, res) => {
    try {
        const { address: addr, address1: addr1, address2: addr2, address3: addr3, city, province, country, postalcode, neighbourhood, Contact: cont } = req.body;

        let address1 = addr1;
        let address2 = addr2;
        let address3 = addr3;

        if (addr) {
            let addressLines = addr ? addr.split("\n") : [];
            address1 = addressLines.length > 0 ? addressLines[0] : '';
            address2 = addressLines.length > 1 ? addressLines[1] : '';
            address3 = addressLines.length > 2 ? addressLines[2] : '';
        }

        const merchant = await Merchant.findOne({
            where: { id: req.params.merchantId },
            paranoid: false,
            include: {
                model: Address,
                where: {
                    id: req.params.id
                }
            }
        });

        if (!merchant) {
            return res.status(404).json({message: 'Merchant not found.'});
        }
        if (!merchant.Addresses || !Array.isArray(merchant.Addresses) || !merchant.Addresses.length) {
            return res.status(404).json({message: 'Address not found.'});
        }

        const address = {
            address1, address2, address3, city, province, postalcode, country, neighbourhood, Contact: cont
        }

        let newAddress = {
            address1,
            address2,
            address3,
            city,
            province,
            country,
            postalcode,
            neighbourhood,
            full: Utils.getFullAddress(address),
        }

        GoogleAPIService.getPlace(merchant.title, address).then(function(place) {
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
                    where: { id : req.params.id }
                }
            )

            if (address.Contact) {
                const contact = {
                    AddressId: req.params.id,
                    email: address.Contact.email,
                    email2: address.Contact.email2,
                    phone: Utils.numberOrNull(address.Contact.phone),
                    phone2: Utils.numberOrNull(address.Contact.phone2)
                };
                Contact.findOne({
                    where: {
                        AddressId: req.params.id
                    }
                }).then(existing => {
                    if (existing == null) {
                        LoggingService.log('Inserting new contact.');
                        Contact.create(contact).catch((err) => console.log(err));
                    }else{
                        LoggingService.log('Updating existing contact.');
                        Contact.update(contact, {
                            where: {
                                id: existing.id
                            }
                        }).catch((err) => console.log(err));
                    }
                }).catch((err) => console.log(err));
            }

            return res.status(200).json({ newAddress });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete an address by id
router.delete("/:id", checkJwt, ownsMerchant, async (req, res) => {
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