import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Crypto } from 'crypto';
import { User } from '../database/models';

const router = Router();

// Create a user
router.post("/", async (req, res) => {
    try {
        const salt = Crypto.randomBytes(16).toString('base64');
        const hash = Crypto.createHmac('sha512',salt)
                                .update(req.body.password)
                                .digest('base64');

        req.body.password = salt + "$" + hash;
        req.body.permissionLevel = 1;
        const user = await User.create(req.body)
        return res.status(201).json({ id: user.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a user by id
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.params.id
            },
            attributes: [
                'id', 'firstName', 'lastName', 'email', 'permissionLevel'
            ]
        });

        if(!user) {
            return res.status(404).json({ message: 'the user with the given id was not found' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Update a user by id
router.patch("/:id", async (req, res) => {
    try {
        if (req.body.password) {
            const salt = Crypto.randomBytes(16).toString('base64');
            const hash = Crypto.createHmac('sha512',salt)
                                .update(req.body.password)
                                .digest('base64');

            req.body.password = salt + "$" + hash;
        }

        const user = await User.update({
            where: {
                id: req.params.id
            },
            attributes: []
        }, { fields: ['firstName', 'lastName', 'email', 'password']});

        if(!user) {
            return res.status(404).json({ message: 'the user with the given id was not found' });
        }

        return res.status(204).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;