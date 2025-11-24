export enum OutboxEventStatus {
	PENDING = "PENDING",
	PROCESSED = "PROCESSED",
	FAILED = "FAILED",
}

export class OutboxEvent {
	constructor(
		public readonly id: string,
		public readonly aggregateId: string,
		public readonly eventType: string,
		public readonly payload: object,
		public status: OutboxEventStatus,
		public readonly createdAt: Date,
		public processedAt?: Date,
		public retryCount: number = 0
	) {}

	static create(
		id: string,
		aggregateId: string,
		eventType: string,
		payload: object
	): OutboxEvent {
		return new OutboxEvent(
			id,
			aggregateId,
			eventType,
			payload,
			OutboxEventStatus.PENDING,
			new Date(),
			undefined,
			0
		);
	}

	markAsProcessed(): void {
		this.status = OutboxEventStatus.PROCESSED;
		this.processedAt = new Date();
	}

	markAsFailed(): void {
		this.status = OutboxEventStatus.FAILED;
		this.retryCount += 1;
	}
}
