export enum AuditAction {
	CREATE = "CREATE",
	UPDATE = "UPDATE",
	DELETE = "DELETE",
}

export enum AuditStatus {
	SUCCESS = "SUCCESS",
	FAILED = "FAILED",
	ROLLED_BACK = "ROLLED_BACK",
}

export enum AggregateType {
	TRANSACTION = "TRANSACTION",
	USER = "USER",
}
