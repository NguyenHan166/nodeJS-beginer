'use strict';

const _ = require('lodash');
const {Types} = require('mongoose');

const convertToObjectIdMongoDb = id => Types.ObjectId.createFromHexString(id);

const getInfoData = ({fields = [], object = {}}) => {
    return _.pick(object, fields);
}

const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]));
}

const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 0]));
}

const removeUndefinedObject = obj => {
    Object.keys(obj).forEach(key => {
        if (obj[key] === null) {
            delete obj[key];
        }
    });

    return obj;
}

const updateNestedObjectParser = obj => {
    const final = {}

    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'Object' && !Array.isArray(obj[key])) {
            const response = updateNestedObjectParser(obj[key]);
            Object.keys(response).forEach(subKey => {
                final[`${key}.${subKey}`] = response[subKey];
            });
        }else{
            final[key] = obj[key];
        }
    });

    return final;
}

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongoDb
}