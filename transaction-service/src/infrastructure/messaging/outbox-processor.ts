import { IOutboxRepository } from "../../domain/repositories/outbox-repository.port";
import { RabbitMQClient } from "./rabbit-mq-client";

export class OutboxProcessor {
	private isRunning = false;
	private intervalId: NodeJS.Timeout | null = null;

	constructor(
		private outboxRepo: IOutboxRepository,
		private messageQueue: RabbitMQClient,
		private batchSize: number = 10,
		private pollIntervalMs: number = 1000
	) {}

	start(): void {
		if (this.isRunning) return;
		this.isRunning = true;
		this.intervalId = setInterval(
			() => this.processBatch(),
			this.pollIntervalMs
		);
		console.log("Outbox processor started");
	}

	stop(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isRunning = false;
		console.log("Outbox processor stopped");
	}

	private async processBatch(): Promise<void> {
		try {
			const events = await this.outboxRepo.findPendingEvents(this.batchSize);

			for (const event of events) {
				try {
					const message = {
						eventId: event.id,
						aggregateId: event.aggregateId,
						eventType: event.eventType,
						timestamp: event.createdAt.toISOString(),
						version: "1.0.0",
						payload: event.payload,
					};

					await this.messageQueue.publish(event.eventType, message);

					event.markAsProcessed();
					await this.outboxRepo.update(event);
					console.log(`Processed outbox event: ${event.id}`);
				} catch (error) {
					console.error(`Failed to process outbox event ${event.id}:`, error);
					event.markAsFailed();
					await this.outboxRepo.update(event);
				}
			}
		} catch (error) {
			console.error("Error processing outbox batch:", error);
		}
	}
}
