import { TransactionEventType } from "@txg/shared-contracts";
import { Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { OutboxEvent } from "../../domain/entities/outbox-event";
import { Transaction } from "../../domain/entities/transaction";
import { IOutboxRepository } from "../../domain/repositories/outbox-repository.port";
import { ITransactionRepository } from "../../domain/repositories/transaction-repository.port";
import { EventPublisher } from "../../infrastructure/messaging/event-publisher";
import {
	CreateTransactionDTO,
	TransactionResponseDTO,
} from "../dto/transaction.dto";

export class CreateTransactionUseCase {
	private eventPublisher: EventPublisher;

	constructor(
		private transactionRepo: ITransactionRepository,
		private outboxRepo: IOutboxRepository,
		private sequelize: Sequelize
	) {
		this.eventPublisher = new EventPublisher();
	}

	async execute(
		userId: string,
		dto: CreateTransactionDTO
	): Promise<TransactionResponseDTO> {
		const transaction = await this.sequelize.transaction();

		try {
			const txn = Transaction.create(
				uuidv4(),
				userId,
				dto.amount,
				dto.currency,
				dto.description
			);

			const createdTransaction = await this.transactionRepo.create(txn);

			const event =
				this.eventPublisher.createTransactionCreatedEvent(createdTransaction);

			const outboxEvent = OutboxEvent.create(
				event.eventId,
				createdTransaction.id,
				TransactionEventType.TRANSACTION_CREATED,
				event.payload
			);

			await this.outboxRepo.create(outboxEvent);
			await transaction.commit();

			return this.toDTO(createdTransaction);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	private toDTO(transaction: Transaction): TransactionResponseDTO {
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
