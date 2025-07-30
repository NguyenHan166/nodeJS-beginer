'use strict'

const redis = require('redis')
const {promisify} = require('util')
const { reservationInventory } = require('../models/repository/inventory.repo')
const redisClient = redis.createClient()

const pexpire = promisify(redisClient.pExpire).bind(redisClient)
const setnxAsync = promisify(redisClient.setNX).bind(redisClient)

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2023_${productId}`;
    const retryTimes = 10;
    const expireTime = 3000;

    for (let i = 0; i < retryTimes.length; i++) {
        // tao mot key, thang nao nam giu duoc vao thanh toan
        const result = await setnxAsync(key, expireTime);
        console.log('result:::', result)

        if (result === 1){
            // thao tac voi inventory
            const isReservation =  await reservationInventory({
                productId,
                quantity,
                cartId
            })

            if (!isReservation.modifiedCount) {
                await pexpire(key, expireTime);
                return key;
            }
            return null;
        }else{
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
}

const releaseLock = async keyLock => {
    const delAsync = promisify(redisClient.del).bind(redisClient);
    return await delAsync(keyLock);
}

module.exports = {
    redisClient,
    acquireLock,
    releaseLock
}