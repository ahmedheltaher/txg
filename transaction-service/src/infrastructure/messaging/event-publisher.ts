import {
	TransactionCreatedEvent,
	TransactionDeletedEvent,
	TransactionEventType,
	TransactionUpdatedEvent,
} from "@txg/shared-contracts";
import { v4 as uuidv4 } from "uuid";
import { Transaction } from "../../domain/entities/transaction";

export class EventPublisher {
	private readonly VERSION = "1.0.0";

	createTransactionCreatedEvent(
		transaction: Transaction
	): TransactionCreatedEvent {
		return {
			eventId: uuidv4(),
			aggregateId: transaction.id,
			eventType: TransactionEventType.TRANSACTION_CREATED,
			timestamp: new Date().toISOString(),
			version: this.VERSION,
			payload: {
				transactionId: transaction.id,
				userId: transaction.userId,
				amount: transaction.amount,
				currency: transaction.currency,
				status: transaction.status,
				description: transaction.description,
				action: "CREATE",
				createdAt: transaction.createdAt.toISOString(),
			},
		};
	}

	createTransactionUpdatedEvent(
		transaction: Transaction,
		oldStatus: string
	): TransactionUpdatedEvent {
		return {
			eventId: uuidv4(),
			aggregateId: transaction.id,
			eventType: TransactionEventType.TRANSACTION_UPDATED,
			timestamp: new Date().toISOString(),
			version: this.VERSION,
			payload: {
				transactionId: transaction.id,
				userId: transaction.userId,
				oldStatus,
				newStatus: transaction.status,
				action: "UPDATE",
				updatedAt: transaction.updatedAt.toISOString(),
			},
		};
	}

	createTransactionDeletedEvent(
		transactionId: string,
		userId: string
	): TransactionDeletedEvent {
		return {
			eventId: uuidv4(),
			aggregateId: transactionId,
			eventType: TransactionEventType.TRANSACTION_DELETED,
			timestamp: new Date().toISOString(),
			version: this.VERSION,
			payload: {
				transactionId,
				userId,
				action: "DELETE",
				deletedAt: new Date().toISOString(),
			},
		};
	}
}
