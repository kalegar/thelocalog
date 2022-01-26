import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import { Image } from '../database/models';

const router = Router();

// Retrieve an image
router.get("/:imageId", async (req, res) => {
    try {
        const image = await Image.findOne({
            where: { id: req.params.imageId }
        });
        let img;
        if (image) {
            let data = image.image;
            img = Buffer.from(data, 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });
            return res.end(img);
        }else{
            return res.status(404).json({ message: `Image with id ${req.params.imageId} not found`});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;