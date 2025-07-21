"use strict";

const { model, Schema, Types } = require("mongoose");
const slugify = require("slugify");


const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const productSchema = new Schema(
    {
        product_name: { type: String, required: true },
        product_thumb: { type: String, required: true },
        product_description: String,
        product_slug: String,
        product_price: { type: Number, required: true },
        product_quantity: { type: Number, required: true },
        product_type: {
            type: String,
            required: true,
            enum: ["Electronics", "Clothing", "Furniture"],
        },
        product_shop: String, // {type: Schema.Types.ObjectId, ref: 'User', },
        product_attributes: { type: Schema.Types.Mixed, required: true },
        //more
        product_ratingAverage: {
            type: Number,
            default: 4.5,
            min: 1,
            max: 5,
            set: (val) => Math.round(val * 10) / 10,
        }, // Round to one decimal place

        product_variations: {
            type: Array,
            default: [],
        },
        isDraft: {type: Boolean, default: true, index: true, select: false}, // Indicate if the product is a draft
        isPublished: {type: Boolean, default: false, index: true, select: false}, // Indicate if the product is published
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
);

// create index for search

productSchema.index({product_name: 'text', product_description: 'text'})

//document middleware to create slug: run before save and create
productSchema.pre('save', function(next) {
    this.product_slug = slugify(this.product_name, {
        lower: true,
    });
    next();
});


const clothingSchema = new Schema(
    {
        brand: { type: String, required: true },
        size: String,
        material: String,
        product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    },
    {
        collection: "clothes",
        timestamps: true,
    }
);

const electronicSchema = new Schema(
    {
        manufacturer: { type: String, required: true },
        model: String,
        color: String,
        product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    },
    {
        collection: "electronics",
        timestamps: true,
    }
);

const furnitureSchema = new Schema(
    {
        brand: { type: String, required: true },
        size: String,
        material: String,
        product_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    },
    {
        collection: "furnitures",
        timestamps: true,
    }
);

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model("Electronics", electronicSchema),
    clothing: model("Clothings", clothingSchema),
    furniture: model("Furnitures", furnitureSchema),
};
