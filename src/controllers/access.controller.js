'use strict';

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const accessService = require("../services/access.service");



class AccessController {

    handlerRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            metadata: await accessService.handlerRefreshToken(req.body.refreshToken)
        }).send(res)
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await accessService.login(req.body)
        }).send(res)
    }

    signUp = async (req, res, next) => {
        new CREATED({
            message: 'Register Ok',
            metadata: await accessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res)
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout success',
            metadata: await accessService.logout(req.keyStore)
        }).send(res)
    }

}

module.exports = new AccessController();