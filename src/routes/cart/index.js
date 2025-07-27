'use strict'

const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');

router.use(authentication);
router.post('', asyncHandler(cartController.addToCart));
router.post('/update', asyncHandler(cartController.update));
router.delete('', asyncHandler(cartController.delete));
router.get('', asyncHandler(cartController.listToCart));

module.exports = router;