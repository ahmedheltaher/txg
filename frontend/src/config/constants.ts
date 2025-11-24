import {
	AggregateType,
	AuditAction,
	AuditStatus,
	Currency,
	TransactionStatus,
} from "@/types";

export const CURRENCIES: Currency[] = ["USD", "EUR", "GBP"];
export const TRANSACTION_STATUSES: TransactionStatus[] = [
	"PENDING",
	"COMPLETED",
	"FAILED",
	"CANCELLED",
];
export const AUDIT_ACTIONS: AuditAction[] = ["CREATE", "UPDATE", "DELETE"];
export const AUDIT_STATUSES: AuditStatus[] = [
	"SUCCESS",
	"FAILED",
	"ROLLED_BACK",
];
export const AGGREGATE_TYPES: AggregateType[] = ["TRANSACTION"];

export const API_CONFIG = {
	transactionBaseUrl: import.meta.env.VITE_TRANSACTION_API_URL || "",
	auditBaseUrl: import.meta.env.VITE_AUDIT_API_URL || "",
} as const;

declare global {
	interface ImportMeta {
		env: {
			VITE_TRANSACTION_API_URL: string;
			VITE_AUDIT_API_URL: string;
		};
	}
}
