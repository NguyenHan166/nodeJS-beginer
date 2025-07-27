'use strict';

const { NotFoundError } = require('../core/error.response');
/**
 * Key fetures:
 * - add products to cart [user]
 * - reduce product quantity in cart [user]
 * - increase product quantity in cart [user]
 * - remove product from cart [user]
 * - get cart [user]
 * - delete cart [user]
 */

const cartModel = require('../models/cart.model');
const { getProductById } = require('../models/repository/product.repo');

class CartService {

    static async createUserCart({userId, product}) {
        const query = {cart_userId: userId, cart_state: 'active'},
        updateOrInsert = {
            $addToSet: {cart_products: product},
        }, options = {upsert: true, new: true};
        
        return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
    }

    static async updateUserCartQuantity({userId, product}) {
        const {productId, quantity} = product;
        const query = {
            cart_userId: userId, 
            'cart_products.productId': productId,
            cart_state: 'active'
        }, updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        }, options = {new: true , upsert: true};
        
        return await cartModel.findOneAndUpdate(query, updateSet, options);
    }

    static async addToCart({userId , product = {}}){
        const userCart = await cartModel.findOne({cart_userId: userId});
        if (!userCart) {
            // create new cart
            return await CartService.createUserCart({userId, product});
        }

        // neu co gio hang nhung chua co san pham
        if (userCart.cart_products.length === 0) {
            userCart.cart_products = [product];
            return await userCart.save();
        }

        // neu gio hang da co san pham thi update quantity
        return await CartService.updateUserCartQuantity({userId, product});
    }

    // update cart
    /**
        shop_order_ids: [
            {
                shopId,
                item_products: [
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId
                    }
                ],
                version
            }
        ]
     */
    static async addToCartV2({userId, shop_order_ids}){
        const {productId, quantity, old_quantity} = shop_order_ids[0]?.item_products[0]
        const foundProduct = await getProductById(productId);
        if (!foundProduct) {
            throw new NotFoundError("Product not found");
        }

        // compare 
        if (foundProduct.product_shop.toString() !== shop_order_ids[0].shopId) {
            throw new NotFoundError("Product not found in this shop");
        }

        if (quantity === 0){
            // delete
        }
        
        return await CartService.updateUserCartQuantity({
            userId, 
            product: {
                productId,
                quantity: quantity - old_quantity
            }
        });
        
    }

    static async deleteUserCart({userId, productId}){
        const query = {cart_userId: userId, cart_state: 'active'},
        updateSet = {
            $pull: {
                cart_products: {productId}
            }
        }, options = {new: true};
        const deletedCart = await cartModel.updateOne(query, updateSet, options);

        return deletedCart;
    }

    static async getListCart({userId}) {
        return await cartModel.findOne({
            cart_userId: userId,
            cart_state: 'active'
        }).lean();
    }
}

module.exports = CartService;
