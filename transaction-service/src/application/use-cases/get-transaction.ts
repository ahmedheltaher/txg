import {
	AuthorizationError,
	NotFoundError,
} from "../../domain/errors/custom-errors";
import { ITransactionRepository } from "../../domain/repositories/transaction-repository.port";
import { TransactionResponseDTO } from "../dto/transaction.dto";

export class GetTransactionUseCase {
	constructor(private transactionRepo: ITransactionRepository) {}

	async execute(id: string, userId: string): Promise<TransactionResponseDTO> {
		const transaction = await this.transactionRepo.findById(id);

		if (!transaction) {
			throw new NotFoundError("Transaction");
		}

		if (transaction.userId !== userId) {
			throw new AuthorizationError(
				"You are not authorized to access this transaction"
			);
		}

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
