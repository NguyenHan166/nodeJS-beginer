'use strict'

const { NotFoundError } = require("../core/error.response");
const inventoryModel = require("../models/inventory.model");
const { getProductById } = require("../models/repository/product.repo");

class InventoryService {
    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location = '123 Main St, Springfield, USA'
    }) {
        const product = await getProductById(productId);
        if (!product) {
            throw new NotFoundError(`Product with ID ${productId} not found`);
        }

        const query = {inven_shopId: shopId, inven_productId: productId},
        updateSet = {
            $inc: {
                inven_stock: stock
            },
            $set: {
                inven_location: location
            }
        },
        options = {upsert: true, new: true};

        return await inventoryModel.findOneAndUpdate(query, updateSet, options);
    }
}

module.exports = InventoryService;