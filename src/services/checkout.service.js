"use strict";

const { NotFoundError, BadRequestError } = require("../core/error.response");
const orderModel = require("../models/order.model");
const { findCartById } = require("../models/repository/cart.repo");
const { checkProductByServer } = require("../models/repository/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");

class CheckoutService {
    /**
     *
     * {
     *   cartId: 'cart_id',
     *   userId: 'user_id',
     *   shop_order_ids: [{
     *       shopId: 'shop_id',
     *       shop_discount: [
     *          {
     *            discountId: 'discount_id',
     *            shopId: 'shop_id',
     *            code: 'discount_code',
     *        }]
     *       item_products: [{
     *           productId: 'product_id',
     *           quantity: 1,
     *           price: 100
     *       }]
     *   }]
     */
    static async checkoutReview({ cartId, userId, shop_order_ids }) {
        // check cartId 
        const foundCart = await findCartById(cartId);
        if (!foundCart) {
            throw new NotFoundError('Cart not found');
        }

        const checkoutOrder = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0,
        }, shop_orders_ids_new = [];

        // tinh tong tien bill
        for (let i = 0 ; i < shop_order_ids.length; i++){
            const {shopId, shop_discount = [], item_products} = shop_order_ids[i];
            // check products available
            const checkProductServer = await checkProductByServer(item_products);
            console.log('checkProductServer', checkProductServer);
            if (!checkProductServer[0]) {
                throw new BadRequestError(`Product not found in shop ${shopId}`);
            }

            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price);
            }, 0)

            // tong tien truoc khi xu ly
            checkoutOrder.totalPrice += checkoutPrice;

            const item_checkout = {
                shopId,
                shop_discount,
                priceRaw: checkoutPrice,
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            // neu shop_discount ton tai --> check discount
            if (shop_discount.length > 0) {
                // gia su chi co 1 discount
                const {totalPrice = 0, discount = 0} = await getDiscountAmount({
                    codeId: shop_discount[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })

                // tong cong discount  giam gia
                checkoutOrder.totalDiscount += discount;

                if (discount > 0) {
                    item_checkout.priceApplyDiscount = checkoutPrice - discount;
                }
            }

            // tong tien thanh toan
            checkoutOrder.totalCheckout += item_checkout.priceApplyDiscount;
            shop_orders_ids_new.push(item_checkout);
        }

        return {
            shop_order_ids,
            shop_orders_ids_new,
            checkoutOrder
        }
    }

    //order 
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {},
    }) {
        const {shop_order_ids_new, checkoutOrder} = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })

        // check lai 1 lan nua xem vuot ton kho hay khong
        const products = shop_order_ids_new.flatMap(order => order.item_products);
        console.log('[1:]', products)
        const acquireProduct = []
        for (let i = 0; i < products.length; i++) {
            const {productId, quantity } = products[i];
            const keyLock = await acquireLock(productId, quantity, cartId);
            acquireProduct.push(keyLock ? true: false);
            if (keyLock) {
                await releaseLock(keyLock);
            }
        }

        // check if co mojt san pham het han trong kho
        if (acquireProduct.includes(false)) {
            throw new BadRequestError('Some products are out of stock');
        }

        const newOrder = await orderModel.create({
            order_userId: userId,
            order_checkout: checkoutOrder,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new,
        })

        // neu insert thanh cong thi remove products co trong gio hang
        if (newOrder) {
            // remove prioducts in cart
        }

        return newOrder;
    }

    static async getOrderByUser() {

    }

    static async getOneOrderByUser(){

    }

    static async cancelOrderByUser() {

    }

    static async updateOrderStatusByShop() {
        
    }
}

module.exports = CheckoutService;
