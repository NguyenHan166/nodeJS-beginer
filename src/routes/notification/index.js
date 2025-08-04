'use strict';

const express = require('express');
const NotificationController = require('../../controllers/notification.controller');
const  asyncHandler  = require('../../helpers/asyncHandler');
const { authentication, authenticationV2 } = require('../../auth/authUtils');
const router = express.Router();


router.use(authenticationV2)
router.get('/:userId', asyncHandler(NotificationController.listNotiByUser));

module.exports = router;