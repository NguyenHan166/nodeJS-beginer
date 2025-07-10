'use strict'

const apikeyModel = require("../models/apikey.model")
const crypto = require('crypto')

const findById = async (key) => {

    // const newKey = await apikeyModel.create({
    //     key: crypto.randomBytes(16).toString('hex'),
    //     status: true,
    //     permissions: ['0000'] // default permissions
    // })

    // console.log(`New API Key Created: ${newKey.key}`)

    const objKey = await apikeyModel.findOne({key, status: true}).lean()
    return objKey
}

module.exports = {
    findById
}   