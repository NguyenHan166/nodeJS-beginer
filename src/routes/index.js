'use strict';

const express = require('express');
const { apiKey, permissions } = require('../auth/checkAuth');
const router = express.Router();

// check api key
router.use(apiKey)

// check permissions
router.use(permissions('0000')); // replace '0000' with the required permission code

router.use('/v1/api', require('./access')); // access routes

module.exports = router;