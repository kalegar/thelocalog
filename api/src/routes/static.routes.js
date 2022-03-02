import "core-js/stable";
import "regenerator-runtime/runtime";

import { Router } from 'express';
import logger from "../service/logger.service";
import * as fs from 'fs';

const assetsDir = process.env.ASSETS_DIR ? process.env.ASSETS_DIR : '/src/assets';

class AssetLoader {
    constructor() {
        this.assets = {};
    }
    getImage(name,extension) {
        return this.getAsset('images',name,extension);
    }
    getAsset(directory,name,extension) {
        const loader = this;
        return new Promise((resolve,reject) => {
            try {
                if (name in loader.assets) {
                    resolve(loader.assets[name]);
                }else if (extension.length) {
                    // Try to load the asset
                    const path = `${process.cwd()}${assetsDir}/${directory}/${name}.${extension}`;
                    fs.readFile(path, function(err, data) {
                        if (err) {
                            logger.error(err);
                            reject(err);
                        }else{
                            loader.assets[name] = data;
                            resolve(data);
                        }
                        
                    });
                }
            } catch (err) {
                logger.error(err);
                reject(err);
            }
        });
    }
}

const assetLoader = new AssetLoader();

const router = Router();

// Retrieve an image
router.get("/localoglogo", async (req, res) => {
    try {
        const image = await assetLoader.getImage('localog_logo_circle_150','png');
        if (image) {
            let data = image;
            const cacheTime = 60 * 60 * 24; // 24 Hours
            const img = Buffer.from(data, 'base64');
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length,
                'Cache-Control': `public, max-age=${cacheTime}`
            });
            return res.end(img);
        }else{
            return res.status(404).json({ message: `Not Found`});
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;