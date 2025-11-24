import { TransactionEventType } from "@txg/shared-contracts";
import { Sequelize } from "sequelize";
import { OutboxEvent } from "../../domain/entities/outbox-event";
import {
	AuthorizationError,
	BusinessRuleError,
	NotFoundError,
} from "../../domain/errors/custom-errors";
import { IOutboxRepository } from "../../domain/repositories/outbox-repository.port";
import { ITransactionRepository } from "../../domain/repositories/transaction-repository.port";
import { EventPublisher } from "../../infrastructure/messaging/event-publisher";

export class DeleteTransactionUseCase {
	private eventPublisher: EventPublisher;

	constructor(
		private transactionRepo: ITransactionRepository,
		private outboxRepo: IOutboxRepository,
		private sequelize: Sequelize
	) {
		this.eventPublisher = new EventPublisher();
	}

	async execute(id: string, userId: string): Promise<void> {
		const transaction = await this.sequelize.transaction();

		try {
			const txn = await this.transactionRepo.findById(id);

			if (!txn) {
				throw new NotFoundError("Transaction");
			}

			if (txn.userId !== userId) {
				throw new AuthorizationError(
					"You are not authorized to delete this transaction"
				);
			}

			if (!txn.canBeDeleted()) {
				throw new BusinessRuleError("Cannot delete completed transaction");
			}

			const event = this.eventPublisher.createTransactionDeletedEvent(
				txn.id,
				txn.userId
			);

			const outboxEvent = OutboxEvent.create(
				event.eventId,
				txn.id,
				TransactionEventType.TRANSACTION_DELETED,
				event.payload
			);

			await this.transactionRepo.delete(id);
			await this.outboxRepo.create(outboxEvent);
			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}
}
