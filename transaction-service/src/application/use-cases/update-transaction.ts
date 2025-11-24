import { TransactionEventType } from "@txg/shared-contracts";
import { Sequelize } from "sequelize";
import { OutboxEvent } from "../../domain/entities/outbox-event";
import {
	AuthorizationError,
	NotFoundError,
} from "../../domain/errors/custom-errors";
import { IOutboxRepository } from "../../domain/repositories/outbox-repository.port";
import { ITransactionRepository } from "../../domain/repositories/transaction-repository.port";
import { EventPublisher } from "../../infrastructure/messaging/event-publisher";
import {
	TransactionResponseDTO,
	UpdateTransactionDTO,
} from "../dto/transaction.dto";

export class UpdateTransactionUseCase {
	private eventPublisher: EventPublisher;

	constructor(
		private transactionRepo: ITransactionRepository,
		private outboxRepo: IOutboxRepository,
		private sequelize: Sequelize
	) {
		this.eventPublisher = new EventPublisher();
	}

	async execute(
		id: string,
		userId: string,
		dto: UpdateTransactionDTO
	): Promise<TransactionResponseDTO> {
		const transaction = await this.sequelize.transaction();

		try {
			const txn = await this.transactionRepo.findById(id);

			if (!txn) {
				throw new NotFoundError("Transaction");
			}

			if (txn.userId !== userId) {
				throw new AuthorizationError(
					"You are not authorized to update this transaction"
				);
			}

			const oldStatus = txn.status;
			txn.update(dto.status);

			const updatedTransaction = await this.transactionRepo.update(txn);

			const event = this.eventPublisher.createTransactionUpdatedEvent(
				updatedTransaction,
				oldStatus
			);

			const outboxEvent = OutboxEvent.create(
				event.eventId,
				updatedTransaction.id,
				TransactionEventType.TRANSACTION_UPDATED,
				event.payload
			);

			await this.outboxRepo.create(outboxEvent);
			await transaction.commit();

			return this.toDTO(updatedTransaction);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	private toDTO(transaction: any): TransactionResponseDTO {
		return {
			id: transaction.id,
			userId: transaction.userId,
			amount: transaction.amount,
			currency: transaction.currency,
			status: transaction.status,
			description: transaction.description,
			createdAt: transaction.createdAt,
			updatedAt: transaction.updatedAt,
		};
	}
}
