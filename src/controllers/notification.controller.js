'use strict'

const { SuccessResponse } = require("../core/success.response");
const NotificationService = require("../services/notification.service")

class NotificationController {

    listNotiByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'List notifications by user successfully',
            metadata: await NotificationService.listNotiNByUser(req.query)
        }).send(res);
    }

}

module.exports = new NotificationController();