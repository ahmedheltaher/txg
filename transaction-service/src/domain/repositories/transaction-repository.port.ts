import { Transaction } from "../entities/transaction";

export interface ITransactionRepository {
	create(transaction: Transaction): Promise<Transaction>;
	findById(id: string): Promise<Transaction | null>;
	findByUserId(
		userId: string,
		limit: number,
		offset: number
	): Promise<Transaction[]>;
	findAll(limit: number, offset: number): Promise<Transaction[]>;
	update(transaction: Transaction): Promise<Transaction>;
	delete(id: string): Promise<void>;
	count(userId?: string): Promise<number>;
}
