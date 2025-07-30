const  redisPublishService = require('../services/redis.Pubsub.service');


class ProductServiceTest {

    purchaseProduct(productId, quantity)  {
        // Test purchase functionality 
        const order = {
            productId,
            quantity,
        }

        redisPublishService.publish('purchase_events', JSON.stringify(order))
    }
}

module.exports = new ProductServiceTest();