import amqp, { Channel, ChannelModel } from "amqplib";
import { config } from "../../config";

export class RabbitMQClient {
	private connection: ChannelModel | null = null;
	private channel: Channel | null = null;
	private readonly exchangeName = "transaction.events";

	async connect(): Promise<void> {
		try {
			this.connection = await amqp.connect(config.rabbitmq.url);
			this.channel = await this.connection.createChannel();

			await this.channel.assertExchange(this.exchangeName, "topic", {
				durable: true,
			});

			console.log("RabbitMQ connected successfully");
		} catch (error) {
			console.error("Failed to connect to RabbitMQ:", error);
			throw error;
		}
	}

	async publish(routingKey: string, message: object): Promise<void> {
		if (!this.channel) {
			throw new Error("RabbitMQ channel not initialized");
		}

		const messageBuffer = Buffer.from(JSON.stringify(message));

		this.channel.publish(this.exchangeName, routingKey, messageBuffer, {
			persistent: true,
			contentType: "application/json",
			timestamp: Date.now(),
		});
	}

	async close(): Promise<void> {
		await this.channel?.close();
		await this.connection?.close();
	}
}
