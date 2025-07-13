'use strict'

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/keyToken.service');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}


const createTokenPair = async (payload, publicKey, privateKey) => {

    try {
        // access tokens
        const accessToken = JWT.sign(payload, publicKey, {
            expiresIn: '1h' // 1 hour
        });

        // refresh token
        const refreshToken = JWT.sign(payload, privateKey, {
            expiresIn: '7d' // 7 days
        });

        JWT.verify(accessToken, publicKey, (err, decoded) => {
            if (err){
                console.error('Error verifying access token:', err);
            }else {
                console.log('Access token is valid:', decoded);
            }
        })

        return {
            accessToken,
            refreshToken
        };

    } catch (error) {
        console.error('Error creating token pair:', error);
        throw new Error('Failed to create token pair');
    }

}

const authentication = asyncHandler(async (req , res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID]

    if (!userId) throw new AuthFailureError('Invalid Request')

    const keyStore = await findByUserId(userId)

    if (!keyStore) throw new NotFoundError('Not Found Key Stored')
    
    const accessToken = req.headers[HEADER.AUTHORIZATION]

    if (!accessToken) throw new AuthFailureError('Invalid Request')

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid User')

        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }

    
})

const verifyJWT = async (token ,keySecret) => {
    return await JWT.verify(token, keySecret);
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT
}