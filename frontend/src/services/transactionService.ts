import { API_CONFIG } from "@/config/constants";
import type { AuthResponse, PaginatedResponse, Transaction } from "@/types";
import { apiClient } from "./api";

export const transactionService = {
	async login(email: string, password: string): Promise<AuthResponse> {
		return apiClient.post<AuthResponse>(
			`${API_CONFIG.transactionBaseUrl}/auth/login`,
			{ email, password }
		);
	},

	async getTransactions(
		page: number,
		limit: number
	): Promise<PaginatedResponse<Transaction>> {
		return apiClient.get<PaginatedResponse<Transaction>>(
			`${API_CONFIG.transactionBaseUrl}/transactions?page=${page}&limit=${limit}`
		);
	},

	async createTransaction(data: {
		amount: number;
		currency: string;
		description: string;
	}): Promise<Transaction> {
		return apiClient.post<Transaction>(
			`${API_CONFIG.transactionBaseUrl}/transactions`,
			data
		);
	},

	async updateTransaction(
		id: string,
		data: { status: string }
	): Promise<Transaction> {
		return apiClient.put<Transaction>(
			`${API_CONFIG.transactionBaseUrl}/transactions/${id}`,
			data
		);
	},

	async deleteTransaction(id: string): Promise<void> {
		return apiClient.delete<void>(
			`${API_CONFIG.transactionBaseUrl}/transactions/${id}`
		);
	},
};
