'use strict';

const { json } = require("express");

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const {findById } = require('../services/apiKey.service');

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString();
        if (!key){
            return re.status(403).json({
                message: 'Forbidden: API key is required'
            })
        }

        // check objKey
        const objKey = await findById(key);
        if (!objKey) {
            return res.status(403).json({
                message: 'Forbidden: Invalid API key'
            });
        }

        req.objKey = objKey;
        return next();
    } catch (error) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const permissions = (permissions) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({
                message: 'Forbidden: You do not have permission to access this resource'
            });
        }

        console.log('Permissions::', req.objKey.permissions)

        const validPermission = req.objKey.permissions.includes(permissions);

        if (!validPermission) {
            return res.status(403).json({
                message: 'Forbidden: You do not have permission to access this resource'
            });
        }

        return next();
    }
}

const asyncHandler = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    };
}

module.exports = {
    apiKey,
    permissions,
    asyncHandler
}