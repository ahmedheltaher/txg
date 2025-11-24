import { Currency, TransactionStatus } from "../../domain/entities/transaction";

export interface CreateTransactionDTO {
	amount: number;
	currency: Currency;
	description?: string;
}

export interface UpdateTransactionDTO {
	status?: TransactionStatus;
}

export interface TransactionResponseDTO {
	id: string;
	userId: string;
	amount: number;
	currency: Currency;
	status: TransactionStatus;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface PaginatedTransactionsDTO {
	data: TransactionResponseDTO[];
	total: number;
	page: number;
	limit: number;
}
