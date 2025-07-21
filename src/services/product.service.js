"use strict";

const { BadRequestError } = require("../core/error.response");
const { product, clothing, electronic , furniture} = require("../models/product.model");

// define Factory class to create product

class ProductFactory {
    static async createProduct(type, payload) {
        switch (type) {
            case "Electronic":
                return new Electronics(payload).createProduct();
            case "Clothing":
                return new Clothing(payload).createProduct();
            default:
                throw new BadRequestError(`create new ${type}  error`)
        }
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
        return await product.create({...this, _id: product_id});
    }
}

// define sub-class for different product types
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newClothing)
            throw new BadRequestError("create new Clothing error");

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError("create new Clothing error");

        return newProduct;
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newElectronic)
            throw new BadRequestError("create new Electronics error");

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct)
            throw new BadRequestError("create new Electronics error");

        return newProduct;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newFurniture)
            throw new BadRequestError("create new Furniture error");

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct)
            throw new BadRequestError("create new Furniture error");

        return newProduct;
    }
}

module.exports = ProductFactory;
