'use strict';

const {model, Schema, Types} = require('mongoose');

const DOCUMENT_NAME = 'Shop';
const COLLECTION_NAME = 'Shops';

// Declare the Schema of the Mongo model
const shopSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true, // Ensure shop names are unique
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true, // Ensure email addresses are unique
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive', // Default status is active
    },
    verify: {
        type: Schema.Types.Boolean,
        default: false, // Default verification status is false
    },
    roles: {
        type: Array,
        default: []
    }
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: COLLECTION_NAME, // Specify the collection name
})

module.exports = model(DOCUMENT_NAME, shopSchema);