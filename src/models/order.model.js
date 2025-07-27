'use strict'

const {model , Schema, Types} = require('mongoose')

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'
const orderSchema = new Schema({
    order_userId: {type: Number, required: true},
    order_checkout: {type: Object, default: {}},

    /**
     * order_checkout: {
     *   totalPrice,
     *   totalApplyDiscount,
     *   feeShip
     * }
     * 
     *  user_payment: {
     *   method: 'credit_card',
     *   card_number: '4111111111111111',
     *   expiration: '12/23',
     *   cvv: '123'
     *  }
     */

    order_shipping: {type: Object, default: {}},

// user_address: {
//      *   address: '123 Main St',
//      *   city: 'New York',
//      *   state: 'NY',
//      *   zip: '10001'
//      *
//      * }
    order_payment: {type: Object, default: {}},
    order_products: {type: Array, required: true },
    order_trackingNumber: {type: String, default: '#000118052035'},
    order_status: {type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending'},
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn',
    }
})

module.exports = model(DOCUMENT_NAME, orderSchema)