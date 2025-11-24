export enum TransactionStatus {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	FAILED = "FAILED",
	CANCELLED = "CANCELLED",
}

export enum Currency {
	USD = "USD",
	EUR = "EUR",
	GBP = "GBP",
}

export class Transaction {
	constructor(
		public readonly id: string,
		public readonly userId: string,
		public readonly amount: number,
		public readonly currency: Currency,
		public status: TransactionStatus,
		public readonly createdAt: Date,
		public updatedAt: Date,
		public readonly description?: string
	) {}

	static create(
		id: string,
		userId: string,
		amount: number,
		currency: Currency,
		description?: string
	): Transaction {
		return new Transaction(
			id,
			userId,
			amount,
			currency,
			TransactionStatus.PENDING,
			new Date(),
			new Date(),
			description
		);
	}

	update(status?: TransactionStatus): void {
		if (status) {
			this.status = status;
		}
		this.updatedAt = new Date();
	}

	canBeDeleted(): boolean {
		return this.status !== TransactionStatus.COMPLETED;
	}
}
