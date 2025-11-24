import {
	TransactionCreatedEvent,
	TransactionDeletedEvent,
	TransactionEvent,
	TransactionEventType,
	TransactionUpdatedEvent,
} from "../events/transaction-events";

export class EventValidator {
	static isValidUUID(value: unknown): boolean {
		if (typeof value !== "string") return false;
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		return uuidRegex.test(value);
	}

	static isValidISO8601(value: unknown): boolean {
		if (typeof value !== "string") return false;
		const date = new Date(value);
		return !isNaN(date.getTime()) && date.toISOString() === value;
	}

	static validateTransactionCreated(
		event: unknown
	): event is TransactionCreatedEvent {
		const e = event as TransactionCreatedEvent;

		return (
			this.isValidUUID(e.eventId) &&
			this.isValidUUID(e.aggregateId) &&
			e.eventType === TransactionEventType.TRANSACTION_CREATED &&
			this.isValidISO8601(e.timestamp) &&
			typeof e.version === "string" &&
			typeof e.payload?.transactionId === "string" &&
			typeof e.payload?.userId === "string" &&
			typeof e.payload?.amount === "number" &&
			e.payload?.amount > 0 &&
			typeof e.payload?.currency === "string" &&
			typeof e.payload?.status === "string" &&
			e.payload?.action === "CREATE"
		);
	}

	static validateTransactionUpdated(
		event: unknown
	): event is TransactionUpdatedEvent {
		const e = event as TransactionUpdatedEvent;

		return (
			this.isValidUUID(e.eventId) &&
			this.isValidUUID(e.aggregateId) &&
			e.eventType === TransactionEventType.TRANSACTION_UPDATED &&
			this.isValidISO8601(e.timestamp) &&
			typeof e.version === "string" &&
			typeof e.payload?.transactionId === "string" &&
			typeof e.payload?.userId === "string" &&
			typeof e.payload?.oldStatus === "string" &&
			typeof e.payload?.newStatus === "string" &&
			e.payload?.action === "UPDATE"
		);
	}

	static validateTransactionDeleted(
		event: unknown
	): event is TransactionDeletedEvent {
		const e = event as TransactionDeletedEvent;

		return (
			this.isValidUUID(e.eventId) &&
			this.isValidUUID(e.aggregateId) &&
			e.eventType === TransactionEventType.TRANSACTION_DELETED &&
			this.isValidISO8601(e.timestamp) &&
			typeof e.version === "string" &&
			typeof e.payload?.transactionId === "string" &&
			typeof e.payload?.userId === "string" &&
			e.payload?.action === "DELETE"
		);
	}

	static validateTransactionEvent(event: unknown): event is TransactionEvent {
		const e = event as TransactionEvent;

		if (!e?.eventType) return false;

		switch (e.eventType) {
			case TransactionEventType.TRANSACTION_CREATED:
				return this.validateTransactionCreated(event);
			case TransactionEventType.TRANSACTION_UPDATED:
				return this.validateTransactionUpdated(event);
			case TransactionEventType.TRANSACTION_DELETED:
				return this.validateTransactionDeleted(event);
			default:
				return false;
		}
	}
}
