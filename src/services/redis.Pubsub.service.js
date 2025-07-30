const Redis = require('redis');

class RedisPubSubService {
    constructor() {
        this.subscriber = null;
        this.publisher = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            // Tạo 2 connection riêng biệt cho pub/sub
            this.subscriber = Redis.createClient({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
            });

            this.publisher = Redis.createClient({
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
            });

            // Kết nối cả 2 client
            await Promise.all([
                this.subscriber.connect(),
                this.publisher.connect()
            ]);

            this.isInitialized = true;
            console.log('Redis PubSub initialized successfully');

        } catch (error) {
            console.error('Error initializing Redis PubSub:', error);
            throw error;
        }
    }

    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.init();
        }
    }

    async publish(channel, message) {
        await this.ensureInitialized();
        try {
            const result = await this.publisher.publish(channel, message);
            return result;
        } catch (error) {
            console.error('Publish error:', error);
            throw error;
        }
    }

    async subscribe(channel, callback) {
        await this.ensureInitialized();
        try {
            await this.subscriber.subscribe(channel, (message, subscribedChannel) => {
                if (channel === subscribedChannel) {
                    callback(channel, message);
                }
            });
        } catch (error) {
            console.error('Subscribe error:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.subscriber) await this.subscriber.disconnect();
            if (this.publisher) await this.publisher.disconnect();
            this.isInitialized = false;
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    }
}

module.exports = new RedisPubSubService();