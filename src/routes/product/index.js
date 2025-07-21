'use strict';

const express = require('express');
const productController = require('../../controllers/product.controller');
const  asyncHandler  = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();

router.get('/search/:keySearch', asyncHandler(productController.getListSearchProducts));
router.get('', asyncHandler(productController.findAllProducts));
router.get('/:product_id', asyncHandler(productController.findProduct));

router.use(authenticationV2)

router.post('', asyncHandler(productController.createProduct))
router.post('/publish/:id' , asyncHandler(productController.publishProductByShop));
router.post('/unpublish/:id' , asyncHandler(productController.unPublishProductByShop));

router.patch('/:id', asyncHandler(productController.updateProduct));

// Query

router.get('/drafts/all', asyncHandler(productController.getAllDraftsForShop));
router.get('/published/all', asyncHandler(productController.getAllPublishedForShop));

module.exports = router;