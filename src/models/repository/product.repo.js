"use strict";

const { Types } = require("mongoose");
const {
    product,
    electronic,
    clothing,
    furniture,
} = require("../product.model");
const { getSelectData, unGetSelectData, convertToObjectIdMongoDb } = require("../../utils");
const { get } = require("lodash");
 


const findAllDraftForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip });
};

const findAllPublishedForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip });
};

const searchProducts = async ({ keySearch }) => {
    const regexSearch = new RegExp(keySearch);

    const result = await product
        .find(
            {
                isPublished: true,
                $text: { $search: regexSearch },
            },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .lean();
    return result;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        _id: Types.ObjectId.createFromHexString(product_id),
        product_shop: Types.ObjectId.createFromHexString(product_shop),
    });

    if (!foundShop) return null;

    foundShop.isDraft = false;
    foundShop.isPublished = true;
    const { modifiedCount } = await foundShop.updateOne(foundShop);

    return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
    const foundShop = await product.findOne({
        _id: Types.ObjectId.createFromHexString(product_id),
        product_shop: Types.ObjectId.createFromHexString(product_shop),
    });

    if (!foundShop) return null;

    foundShop.isDraft = true;
    foundShop.isPublished = false;
    const { modifiedCount } = await foundShop.updateOne(foundShop);

    return modifiedCount;
};

const queryProduct = async ({ query, limit, skip }) => {
    return await product
        .find(query)
        .populate("product_shop", "name email -_id")
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    const products = await product
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean();
    return products;
};

const findProduct = async ({product_id , unSelect}) => {
    return await product.findById(product_id).select(unGetSelectData(unSelect)).lean();
}

const getProductById = async (product_id) => {
    return await product.findOne({ _id: convertToObjectIdMongoDb(product_id) }).lean();
}

const updateProductById = async ({ product_id, bodyUpdate, model, isNew = true }) => {
    return await model.findByIdAndUpdate(product_id, bodyUpdate, { new: isNew });
}

const checkProductByServer = async (products) => {
    return await Promise.all(products.map(async (product) => {
        const foundProduct = await getProductById(product.productId);
        if (foundProduct) {
            return {
                price: foundProduct.product_price,
                quantity: foundProduct.product_quantity,
                productId: foundProduct._id,
            }
        }
    }))
}

module.exports = {
    findAllDraftForShop,
    publishProductByShop,
    findAllPublishedForShop,
    unPublishProductByShop,
    searchProducts,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer,
};
