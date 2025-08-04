const amqp = require('amqplib');


const runConsumer = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        const queueName = 'test-topic'

        await channel.assertQueue(queueName, { durable: true })

        // send message to the queue
        channel.consume(queueName, (messages) => {
            console.log(`Message received: ${messages.content.toString()}`);
        }, {
            noAck: true // Acknowledge the message
        });

        // console.log(`Message sent: ${messages}`);


    } catch (error) {
        console.error('Error in consumer:', error);
    }
}

runConsumer().catch(console.error);