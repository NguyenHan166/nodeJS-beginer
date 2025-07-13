'use strict'

const { Types } = require("mongoose");
const keytokenModels = require("../models/keytoken.models");


class KeyTokenService {

    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {

            // const publicKeyString = publicKey.toString();
            // const tokens = await keytokenModels.create({
            //     user: userId,
            //     publicKey: publicKeyString
            // })

            // level 0
            // const tokens = await keytokenModels.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })
            // return tokens ? tokens.publicKey : null;

            // level xx
            const filter = { user: userId }, update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken }, options = { upsert: true, new: true }
            const tokens = await keytokenModels.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null

        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        return await keytokenModels.findOne({ user: userId }).lean()
    }

    static removeKeyById = async (id) => {
        return await keytokenModels.deleteOne({ _id: id });
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModels.findOne({ refreshTokensUsed: refreshToken })
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModels.findOne({ refreshToken })
    }

    static deleteKeyById = async (userId) => {
        return await keytokenModels.deleteOne({ user: userId })
    }


}

module.exports = KeyTokenService;