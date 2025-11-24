import { ITransactionRepository } from "../../domain/repositories/transaction-repository.port";
import { PaginatedTransactionsDTO } from "../dto/transaction.dto";

export class ListTransactionsUseCase {
	constructor(private transactionRepo: ITransactionRepository) {}

	async execute(
		userId: string,
		page: number = 1,
		limit: number = 10
	): Promise<PaginatedTransactionsDTO> {
		const offset = (page - 1) * limit;

		const [transactions, total] = await Promise.all([
			this.transactionRepo.findByUserId(userId, limit, offset),
			this.transactionRepo.count(userId),
		]);

		return {
			data: transactions.map((t) => ({
				id: t.id,
				userId: t.userId,
				amount: t.amount,
				currency: t.currency,
				status: t.status,
				description: t.description,
				createdAt: t.createdAt,
				updatedAt: t.updatedAt,
			})),
			total,
			page,
			limit,
		};
	}
}
