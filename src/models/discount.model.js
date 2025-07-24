
'use strict'

const {model , Schema, Types} = require('mongoose')

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'Discounts'

const discountSchema = new Schema({
    discount_name: {type: String, required: true},
    discount_description: {type: String, required: true},
    discount_type: {type: String, required: true, default: 'fixed_amount'},
    discount_value: {type: Number, required: true},
    discount_code: {type: String, required: true},
    discount_start_date: {type: Date, required: true},
    discount_end_date: {type: Date, required: true},
    discount_max_uses: {type: Number, default: 0},
    discount_uses_count: {type: Number, default: 0}, // so discount da su dung
    discount_users_used: {type: Array , default: []}, // danh sach user da su dung discount
    discount_max_uses_per_user: {type: Number, required: true}, // so luong discount toi da duoc su dung boi moi user
    discount_min_order_value: {type: Number, required: true}, // gia tri don hang toi thieu de duoc ap dung discount
    discount_shopId: {type: Schema.Types.ObjectId, ref: 'Shop', required: true},

    discount_is_active: {type: Boolean, default: true}, // trang thai discount
    discount_applies_to: {type: String, enum: ['all', 'specific'], default: 'all'}, // ap dung cho tat ca san pham hoac san pham cu the
    discount_product_ids: {type: [Schema.Types.ObjectId], ref: 'Product', default: []}, // danh sach san pham duoc ap dung discount
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, discountSchema)