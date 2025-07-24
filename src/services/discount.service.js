/**
 * Discount Service
 *    1 - Generate discount code [Shop \ Admin]
 *    2 - Get discount amount [User]
 *    3 - Get all discount codes [Shop \ Admin]
 *    4 - Verify discount code [User]
 *    5 - Delete discount code [Shop \ Admin]
 *    6 - Cancel discount code [User]
 */

const { BadRequestError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { findAllDiscountCodesUnSelect, checkDiscountExists } = require("../models/repository/discount.repo");
const { convertToObjectIdMongoDb } = require("../utils");
const { findAllProducts } = require("./product.service.xxx");

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            uses_count,
            max_uses_per_user,
        } = payload;

        if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            throw new BadRequestError("Discount code cannot be created in the past.");
        }

        if (new Date(start_date) > new Date(end_date)) {
            throw new BadRequestError("Discount start date cannot be after end date.");
        }

        // create index for discount code
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongoDb(shopId),
        }).lean();

        if (foundDiscount  && foundDiscount.discount_is_active) {
            throw new BadRequestError("Discount code already exists.");
        }

        const newDiscount = await discountModel.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses || 0,
            discount_uses_count: uses_count || 0,
            discount_max_uses_per_user: max_uses_per_user || 1,
            discount_min_order_value: min_order_value || 0,
            discount_shopId: convertToObjectIdMongoDb(shopId),
            discount_is_active: is_active || true,
            discount_applies_to: applies_to || 'all',
            discount_product_ids: product_ids ? product_ids.map(id => convertToObjectIdMongoDb(id)) : [],
        })

        return newDiscount;
    }

    static async updateDiscountCode(discountId, payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            uses_count,
            max_uses_per_user,
        } = payload;

        const updateData = {
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses || 0,
            discount_uses_count: uses_count || 0,
            discount_max_uses_per_user: max_uses_per_user || 1,
            discount_min_order_value: min_order_value || 0,
            discount_shopId: convertToObjectIdMongoDb(shopId),
            discount_is_active: is_active || true,
            discount_applies_to: applies_to || 'all',
        };

        if (product_ids) {
            updateData.discount_product_ids = product_ids.map(id => convertToObjectIdMongoDb(id));
        }

        const updatedDiscount = await discountModel.findByIdAndUpdate(
            convertToObjectIdMongoDb(discountId),
            updateData, 
            { new: true }
        );

        if (!updatedDiscount) {
            throw new BadRequestError("Discount code not found.");
        }

        return updatedDiscount;
    }

    // Get all discount codes available with products
    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit = 50, page = 1
    }) {
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongoDb(shopId),
        }).lean();

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new BadRequestError("Discount code not found.");
        }

        const {discount_applies_to, discount_product_ids} = foundDiscount;
        let products
        if (discount_applies_to === 'all') {
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongoDb(shopId),
                    isPublished: true
                },
                limit: + limit,
                page: + page,
                sort: 'ctime',
                select: ["product_name"]
            })
        }

        if (discount_applies_to === 'specific') {
            products = await findAllProducts({
                filter: {
                    _id: {$in: discount_product_ids},
                    isPublished: true
                },
                limit: + limit,
                page: + page,
                sort: 'ctime',
                select: ["product_name"]
            })
        }

        return products;
    }

    // get all discount code of shop
    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }) {
        const discounts = await findAllDiscountCodesUnSelect({
            limit,
            page,
            filter: {
                discount_shopId: convertToObjectIdMongoDb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_users_used', 'discount_uses_count'],
            model: discountModel
        })

        return discounts;
    }

    // Apply discount code

    static async getDiscountAmount({codeId, userId, shopId, products}) {
        const foundDiscount = await checkDiscountExists(discountModel, {discount_code: codeId, discount_shopId: convertToObjectIdMongoDb(shopId)});

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new BadRequestError("Discount code not found or inactive.");
        }

        const {discount_max_uses , discount_start_date, discount_end_date, discount_min_order_value, discount_max_uses_per_user, discount_users_used, discount_type, discount_value} = foundDiscount;

        if (!discount_max_uses) { // == 0
            throw new BadRequestError("Discount code has reached its maximum usage limit.");
        }

        if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
            throw new BadRequestError("Discount code is not valid at this time.");
        }

        // check xem co gia tri toi thieu hay khong
        let totalOrder = 0
        if (discount_min_order_value > 0) {
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price);
            }, 0);
            
            if (totalOrder < discount_min_order_value) {
                throw new BadRequestError(`Minimum order value of ${discount_min_order_value} is required to apply this discount code.`);
            }
        }

        if (discount_max_uses_per_user > 0) {
            const userUserDiscount = discount_users_used.find(user => user.userId === userId);
            if (userUserDiscount) {
                ///
            }
        }


        // check discount type and calculate amount
        const amount = discount_type === 'fixed_amount' ? discount_value : (totalOrder * (discount_value / 100));

        return {
            totalOrder,
            discountAmount: amount,
            totalPrice: totalOrder - amount,
        }
    }

    static async deleteDiscountCode ({shopId , codeId}) {
        const deleted = await discountModel.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        });

        if (!deleted) {
            throw new BadRequestError("Discount code not found.");
        }

        return deleted;
    }

    static async cancelDiscountCode ({shopId , codeId, userId}) {
        const foundDiscount = await checkDiscountExists(discountModel, {
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        });

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new BadRequestError("Discount code not found or inactive.");
        }

        const result = await discountModel.findOneAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })

        if (!result) {
            throw new BadRequestError("Failed to cancel discount code.");
        }
        return result
    }
    
}


module.exports = DiscountService;