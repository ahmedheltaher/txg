import amqp, { Channel, ChannelModel } from "amqplib";
import { config } from "../../config";

export class RabbitMQClient {
	private connection: ChannelModel | null = null;
	private channel: Channel | null = null;

	async connect(): Promise<void> {
		try {
			this.connection = await amqp.connect(config.rabbitmq.url);
			this.channel = await this.connection.createChannel();
			console.log("RabbitMQ connected successfully");
		} catch (error) {
			console.error("Failed to connect to RabbitMQ:", error);
			throw error;
		}
	}

	async consume(
		exchange: string,
		queueName: string,
		routingKeys: string[],
		handler: (message: any) => Promise<void>
	): Promise<void> {
		if (!this.channel) {
			throw new Error("RabbitMQ channel not initialized");
		}

		await this.channel.assertExchange(exchange, "topic", { durable: true });

		const queue = await this.channel.assertQueue(queueName, {
			durable: true,
			arguments: {
				"x-dead-letter-exchange": `${exchange}.dlx`,
				"x-message-ttl": 86400000,
			},
		});

		await this.channel.assertExchange(`${exchange}.dlx`, "topic", {
			durable: true,
		});
		await this.channel.assertQueue(`${queueName}.dlq`, { durable: true });
		await this.channel.bindQueue(`${queueName}.dlq`, `${exchange}.dlx`, "#");

		for (const routingKey of routingKeys) {
			await this.channel.bindQueue(queue.queue, exchange, routingKey);
		}

		this.channel.consume(queue.queue, async (msg) => {
			if (!msg) return;

			try {
				const content = JSON.parse(msg.content.toString());
				await handler(content);
				this.channel!.ack(msg);
			} catch (error) {
				console.error("Error processing message:", error);
				this.channel!.nack(msg, false, false);
			}
		});

		console.log(`Consuming messages from queue: ${queueName}`);
	}

	async close(): Promise<void> {
		await this.channel?.close();
		await this.connection?.close();
	}
}
