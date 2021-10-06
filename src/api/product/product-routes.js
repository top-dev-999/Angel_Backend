const express = require('express');
const router = express.Router({ mergeParams: true });

const multer = require('multer');
const mkdirp = require('mkdirp');
const path = require('path');

const config = require('../../../config/config');
const HttpUtil = require('../../utilities/http-util');
const roles = require('../../utilities/roles');

const ProductService = require('./product-service');

// if we want to get fancy we can put these into a dependency injector
const productService = new ProductService();

router.get('', (req, res, next) => {
    productService.getProducts().then(products => {
        res.json({ products });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.get('/:productId', (req, res, next) => {
    productService.getProduct(req.params.productId).then(product => {
        res.json({ product });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('', (req, res, next) => {

    if (req.decodedToken.role != roles.ADMIN) {
        HttpUtil.handleUnauthorized(res);
        return;
    }

    productService.createProduct(req.body).then(product => {
        res.json({ product });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/update', (req, res, next) => {

    if (req.decodedToken.role != roles.ADMIN) {
        HttpUtil.handleUnauthorized(res);
        return;
    }

    productService.updateProduct(req.body).then(product => {
        res.json({ product });
    }).catch(err => {
        HttpUtil.handleError(err, res);
    });
});

router.post('/:productId/image', (req, res, next) => {

    if (req.decodedToken.role != roles.ADMIN) {
        HttpUtil.handleUnauthorized(res);
        return;
    }
    
    let productId = req.params.productId;
    let fileUrl = config.baseUrl + '/assets/products/';

    mkdirp('./dist/assets/products', (err) => {
        if (err) { return HttpUtil.handleError(err, res); }

        let storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './dist/assets/products');
            },
            filename: function (req, file, cb) {
                let index = file.originalname.lastIndexOf('.');
                let extension = index > 0 ? file.originalname.substr(index) : '';
                let fileName = productId + extension;
                fileUrl += fileName;
                cb(null, fileName)
            }
        });

        let upload = multer({ storage: storage }).single('file');
        upload(req, res, (err) => {
            if (err) { return HttpUtil.handleError(err, res); }

            productService.updateProductImage(productId, fileUrl).then(product => {
                res.json({ product });
            }).catch(err => {
                HttpUtil.handleError(err, res);
            });
        });
    });
});

module.exports = router;