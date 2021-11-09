import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { MerchantSuggestion } from '../database/models';

import checkJwt from '../middleware/authentication.js';
import adminRole from '../middleware/admin.auth.js';

import { LoggingService } from "../service/logging.service";

const router = Router({mergeParams: true});

// Retrieve all merchant suggestions
router.get("/", checkJwt, adminRole, async (req, res) => {
    try {

        const suggestions = await MerchantSuggestion.findAll();

        res.status(200).json({ suggestions });
        
    } catch (error) {
        LoggingService.log(err,false);
        res.status(500).json({ message: error.message });
    }
});

router.put("/", async (req, res) => {
    try {
        const { title, email, address, category, extra } = req.body;

        const suggestion = await MerchantSuggestion.create({ title, email, address, category, extra });

        res.status(201).json({ suggestion });
    } catch (err) {
        LoggingService.log(err,false);
        res.status(500).json({ message: err.message });
    }
});

router.delete("/:id", checkJwt, adminRole, async (req, res) => {
    const id = req.params.id;
    if (id == null) {
        res.status(404).json({message: 'Invalid ID.'});
        return;
    }
    try {
        await MerchantSuggestion.destroy({ where: {
            id: id
        }});
        res.status(200).send();
    } catch (error) {
        LoggingService.log(err,false);
        res.status(500).json({ message: error.message });
    }
});

export default router;