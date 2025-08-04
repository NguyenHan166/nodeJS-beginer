const amqp = require('amqplib');

const messages = 'Hello RabbitMQ user By Nguyen han!';

const runProducer = async () => {
    try {
        const connection = await amqp.connect('amqp://guest:guest@localhost');
        const channel = await connection.createChannel();

        const queueName = 'test-topic'

        await channel.assertQueue(queueName, { durable: true })

        // send message to the queue
        channel.sendToQueue(queueName, Buffer.from(messages));

        console.log(`Message sent: ${messages}`);


    } catch (error) {
        console.error('Error in producer:', error);
    }
}

runProducer().catch(console.error);