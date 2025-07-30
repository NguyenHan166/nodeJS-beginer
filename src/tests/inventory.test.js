const redisPublishService = require('../services/redis.Pubsub.service');

class InventoryServiceTest {
    constructor() {
        redisPublishService.subscribe('purchase_events', (channel, message) => {
            InventoryServiceTest.updateInventory(JSON.parse(message));
        });
    }

    static updateInventory({ productId, quantity }) {
        console.log(`Cập nhật kho hàng cho sản phẩm ${productId} với số lượng ${quantity}`);
    }
}

module.exports = new InventoryServiceTest();