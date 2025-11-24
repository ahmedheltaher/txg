import {
	Currency,
	Transaction,
	TransactionStatus,
} from "../../../domain/entities/transaction";
import { ITransactionRepository } from "../../../domain/repositories/transaction-repository.port";
import { TransactionModel } from "../models/transaction.model";

export class TransactionRepository implements ITransactionRepository {
	async create(transaction: Transaction): Promise<Transaction> {
		const model = await TransactionModel.create({
			id: transaction.id,
			userId: transaction.userId,
			amount: transaction.amount,
			currency: transaction.currency,
			status: transaction.status,
			description: transaction.description,
			createdAt: transaction.createdAt,
			updatedAt: transaction.updatedAt,
		});

		return this.toDomain(model);
	}

	async findById(id: string): Promise<Transaction | null> {
		const model = await TransactionModel.findByPk(id);
		return model ? this.toDomain(model) : null;
	}

	async findByUserId(
		userId: string,
		limit: number,
		offset: number
	): Promise<Transaction[]> {
		const models = await TransactionModel.findAll({
			where: { userId },
			limit,
			offset,
			order: [["createdAt", "DESC"]],
		});

		return models.map((m) => this.toDomain(m));
	}

	async findAll(limit: number, offset: number): Promise<Transaction[]> {
		const models = await TransactionModel.findAll({
			limit,
			offset,
			order: [["createdAt", "DESC"]],
		});

		return models.map((m) => this.toDomain(m));
	}

	async update(transaction: Transaction): Promise<Transaction> {
		await TransactionModel.update(
			{
				status: transaction.status,
				updatedAt: transaction.updatedAt,
			},
			{
				where: { id: transaction.id },
			}
		);

		const model = await TransactionModel.findByPk(transaction.id);
		return this.toDomain(model!);
	}

	async delete(id: string): Promise<void> {
		await TransactionModel.destroy({ where: { id } });
	}

	async count(userId?: string): Promise<number> {
		return TransactionModel.count(userId ? { where: { userId } } : undefined);
	}

	private toDomain(model: TransactionModel): Transaction {
		return new Transaction(
			model.id,
			model.userId,
			parseFloat(model.amount.toString()),
			model.currency as Currency,
			model.status as TransactionStatus,
			model.createdAt,
			model.updatedAt,
			model.description
		);
	}
}
