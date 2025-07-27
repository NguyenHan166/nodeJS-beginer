"use strict";

const { BadRequestError } = require("../core/error.response");
const {
    product,
    clothing,
    electronic,
    furniture,
} = require("../models/product.model");
const { insertInventory } = require("../models/repository/inventory.repo");
const {
    findAllDraftForShop,
    publishProductByShop,
    findAllPublishedForShop,
    unPublishProductByShop,
    searchProducts,
    updateProductById,
    findAllProducts,
    findProduct
} = require("../models/repository/product.repo");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");
// const productConfig = require("./product.config");

// define Factory class to create product

class ProductFactory {
    static productRegistry = {};

    static registerProductType(type, classRef) {
        // for (const [type, classRef] of Object.entries(productConfig)) {
        //     ProductFactory.productRegistry[type] = classRef;
        // }
        ProductFactory.productRegistry[type] = classRef;
    }

    static async createProduct(type, payload) {
        const ProductClass = ProductFactory.productRegistry[type];
        if (!ProductClass) {
            throw new BadRequestError(`Product type ${type} is not registered`);
        }
        return new ProductClass(payload).createProduct();
    }

    static async updateProduct(type, productId, payload) {
        const ProductClass = ProductFactory.productRegistry[type];
        if (!ProductClass) {
            throw new BadRequestError(`Product type ${type} is not registered`);
        }
        return new ProductClass(payload).updateProduct(productId);
    }

    // query
    static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = { product_shop, isDraft: true };
        return await findAllDraftForShop({ query, limit, skip });
    }

    // query
    static async findAllPublishedForShop({
        product_shop,
        limit = 50,
        skip = 0,
    }) {
        const query = { product_shop, isPublished: true };
        return await findAllPublishedForShop({ query, limit, skip });
    }

    static async searchProducts({ keySearch }) {
        return await searchProducts({ keySearch });
    }

    static async findAllProducts({
        limit = 50,
        sort = "ctime",
        page = 1,
        filter = { isPublished: true },
    }) {
        return await findAllProducts({
            limit,
            sort,
            page,
            filter,
            select: ["product_name", "product_price", "product_thumb", "product_shop"],
        });
    }

    static async findProduct({ product_id }) {
        return await findProduct({ product_id, unSelect: ["__v"] });
    }
    //PUT
    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id });
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id });
    }
}

/**
     product_name: { type: String, required: true },
     product_thumb: { type: String, required: true },
     product_description: String,
     product_price: { type: Number, required: true },
     product_quantity: { type: Number, required: true },
     product_type: {type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture']},
     product_hop: String, // {type: Schema.Types.ObjectId, ref: 'User', },
     product_attributes: {type: Schema.Types.Mixed, required: true}
 */

// define base product class

class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    async createProduct(product_id) {
        const newProduct = await product.create({ ...this, _id: product_id });
        if (newProduct) {

            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            });

        }
        return newProduct;
    }

    async updateProduct(productId, bodyUpdate) {
        return await updateProductById({
            product_id: productId,
            bodyUpdate,
            model: product,
        });
    }
}

// define sub-class for different product types
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newClothing)
            throw new BadRequestError("create new Clothing error");

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError("create new Clothing error");

        return newProduct;
    }

    async updateProduct(productId) {
        const objectParams = removeUndefinedObject(this);
        if (objectParams.product_attributes) {
            // update child
            await updateProductById({
                product_id: productId,
                bodyUpdate: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: clothing,
            });
        }

        const updatedProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        );
        return updatedProduct;
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newElectronic)
            throw new BadRequestError("create new Electronics error");

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct)
            throw new BadRequestError("create new Electronics error");

        return newProduct;
    }

    async updateProduct(productId) {
        const objectParams = this;
        if (objectParams.product_attributes) {
            // update child
            await updateProductById({
                product_id: productId,
                bodyUpdate: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: electronic,
            });
        }

        const updatedProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        );
        return updatedProduct;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop,
        });
        if (!newFurniture)
            throw new BadRequestError("create new Furniture error");

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct)
            throw new BadRequestError("create new Furniture error");

        return newProduct;
    }

    async updateProduct(productId) {
        const objectParams = this;
        if (objectParams.product_attributes) {
            // update child
            await updateProductById({
                product_id: productId,
                bodyUpdate: updateNestedObjectParser(
                    objectParams.product_attributes
                ),
                model: furniture,
            });
        }

        const updatedProduct = await super.updateProduct(
            productId,
            updateNestedObjectParser(objectParams)
        );
        return updatedProduct;
    }
}

// register product types
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
