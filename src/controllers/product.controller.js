"use strict";

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Success create new Product",
            metadata: await ProductServiceV2.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Success update Product",
            metadata: await ProductServiceV2.updateProduct(
                req.body.product_type,
                req.params.id,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

    // query
    /**
     * @description Get all drafts for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return {JSON}
     */

    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all drafts for shop",
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getAllPublishedForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get all published for shop",
            metadata: await ProductServiceV2.findAllPublishedForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Publish product by shop",
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
            }),
        }).send(res);
    };

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Un publish product by shop",
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
            }),
        }).send(res);
    };

    getListSearchProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list search products",
            metadata: await ProductServiceV2.searchProducts({
                keySearch: req.params.keySearch,
            }),
        }).send(res);
    };

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list all products",
            metadata: await ProductServiceV2.findAllProducts(req.query),
        }).send(res);
    };

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get product by id",
            metadata: await ProductServiceV2.findProduct({
                product_id: req.params.product_id,
            }),
        }).send(res);
    };
}

module.exports = new ProductController();
