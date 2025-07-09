'use strict'

const JWT = require('jsonwebtoken');

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

module.exports = {
    createTokenPair
}