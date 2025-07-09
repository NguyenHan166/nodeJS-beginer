'use strict'

const keytokenModels = require("../models/keytoken.models");

class KeyTokenService {

    static createKeyToken = async ({userId, publicKey, privateKey}) => {
        try{

            // const publicKeyString = publicKey.toString();
            // const tokens = await keytokenModels.create({
            //     user: userId,
            //     publicKey: publicKeyString
            // })

            const tokens = await keytokenModels.create({
                user: userId,
                publicKey,
                privateKey
            })

            return tokens ? tokens.publicKey : null;
        }catch (error) {
            return error
        }
    }

}

module.exports = KeyTokenService;