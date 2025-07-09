'use strict';

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    static signUp = async ({ name, email, password }) => {
        try {
            const holderShop = await shopModel.findOne({ email }).lean();
            if (holderShop) {
                return {
                    code: 'xxxx',
                    message: 'Email already registered',
                    status: 'error'
                }
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

        } catch (error) {
            console.error('Error in signUp:', error);
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }

}

module.exports = AccessService;