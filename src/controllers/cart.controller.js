"use strict";

const CartService = require("../services/cart.service");
const { SuccessResponse } = require("../core/success.response");

class CartController {
    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: "Add product to cart successfully",
            metadata: await CartService.addToCart({
                userId: req.user.userId,
                product: req.body.product,
            }),
        }).send(res);
    };

    update = async (req, res, next) => {
        new SuccessResponse({
            message: "Update product quantity in cart successfully",
            metadata: await CartService.addToCartV2({
                userId: req.user.userId,
                product: req.body.product,
            }),
        }).send(res);
    };

    delete = async (req, res, next) => {
        new SuccessResponse({
            message: "Delete product from cart successfully",
            metadata: await CartService.deleteUserCart(req.body),
        }).send(res);
    };

    listToCart = async (req, res, next) => {
        new SuccessResponse({
            message: "Get cart successfully",
            metadata: await CartService.getListCart(req.params.userId),
        }).send(res);
    };
}

module.exports = CartController;
