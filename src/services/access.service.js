'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");

const { findByEmail } = require('./shop.service');
const KeyTokenService = require("./keyToken.service");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    static handlerRefreshToken = async (refreshToken) => {
        const foundToken = await keyTokenService.findByRefreshTokenUsed(refreshToken)

        if (foundToken) {
            const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)

            console.log({ userId, email })

            await keyTokenService.deleteKeyById(userId)
            throw new ForbiddenError(' Something wrong happen!! Please Login')
        }

        const holderToken = await keyTokenService.findByRefreshToken(refreshToken)
        if (!holderToken) throw new AuthFailureError('Shop not registered')

        // verify Token

        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
        const foundShop = await findByEmail({ email })

        if (!foundShop) throw new AuthFailureError('Shop not registered')

        const tokens = await createTokenPair({ userId: foundShop._id, email }, holderToken.publicKey, holderToken.privateKey);

        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // da duoc su dung
            }
        })

        return {
            user: {userId, email},
            tokens
        }
    }


    static login = async ({ email, password, refreshToken = null }) => {
        const foundShop = await findByEmail({ email })

        if (!foundShop) {
            throw new BadRequestError('Shop not registered')
        }

        const math = bcrypt.compare(password, foundShop.password)

        if (!math) throw new AuthFailureError('Authentication Error')

        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKey, privateKey);


        await KeyTokenService.createKeyToken({
            userId: foundShop._id,
            refreshToken: tokens.refreshToken,
            privateKey, publicKey
        })

        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email'],
                object: foundShop
            }),
            tokens
        }

    }

    static signUp = async ({ name, email, password }) => {

        const holderShop = await shopModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestError(`Shop with email ${email} already exists`);
        }

        const passwordHashed = await bcrypt.hash(password, 10);

        const newShop = await shopModel.create({
            name, email, password: passwordHashed, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            // created privateKey, publicKey
            // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            //     modulusLength: 4096, // bits
            //     publicKeyEncoding: {
            //         type: 'pkcs1', // Recommended for public keys
            //         format: 'pem'
            //     },
            //     privateKeyEncoding: {
            //         type: 'pkcs1', // Recommended for public keys
            //         format: 'pem'
            //     },
            // }) // save collectionsKeyStore

            const privateKey = crypto.randomBytes(64).toString('hex');
            const publicKey = crypto.randomBytes(64).toString('hex');

            console.log(`Private Key: ${privateKey}`);
            console.log(`Public Key: ${publicKey}`);

            // const publicKeyString = await keyTokenService.createKeyToken({
            //     userId: newShop._id,
            //     publicKey,
            //     privateKey
            // })

            // if (!publicKeyString) {
            //     return {
            //         code: 'xxxx',
            //         message: 'Failed to create public key',
            //     }
            // }
            // const publicKeyObject = crypto.createPublicKey(publicKeyString)

            const keyStore = await keyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            if (!keyStore) {
                return {
                    code: 'xxxx',
                    message: 'Failed to create key store',
                    status: 'error'
                }
            }

            // created token pair
            // const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyObject, privateKey)
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey);
            console.log(`Access Token: ${tokens.accessToken}`);
            console.log(`Refresh Token: ${tokens.refreshToken}`);

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({
                        fields: ['_id', 'name', 'email'],
                        object: newShop
                    }),
                    tokens
                }
            }
        }

        return {
            code: 200,
            metadata: null
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)

        console.log({ delKey })
        return delKey
    }

}

module.exports = AccessService;