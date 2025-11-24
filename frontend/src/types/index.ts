export interface User {
	userId: string;
	email: string;
}

export interface Transaction {
	id: string;
	userId: string;
	amount: number;
	currency: Currency;
	status: TransactionStatus;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AuditLog {
	id: string;
	eventId: string;
	aggregateId: string;
	aggregateType: AggregateType;
	action: AuditAction;
	userId: string;
	status: AuditStatus;
	metadata: Record<string, unknown>;
	ipAddress?: string;
	userAgent?: string;
	createdAt: string;
}

export type Currency = "USD" | "EUR" | "GBP";
export type TransactionStatus =
	| "PENDING"
	| "COMPLETED"
	| "FAILED"
	| "CANCELLED";
export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type AuditStatus = "SUCCESS" | "FAILED" | "ROLLED_BACK";
export type AggregateType = "TRANSACTION";

export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
}

export interface AuthResponse {
	token: string;
	userId: string;
	email: string;
}

export interface ApiError {
	message: string;
	status?: number;
}

export interface AuditLogFilters {
	userId: string;
	aggregateId: string;
	aggregateType: string;
	action: string;
	status: string;
	startDate: string;
	endDate: string;
}

export interface TransactionFormData {
	amount: string;
	currency: Currency;
	description: string;
	status: TransactionStatus;
}

export type NotificationSeverity = "success" | "error" | "warning" | "info";
