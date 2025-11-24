import {
	Currency,
	Transaction,
	TransactionStatus,
} from "../../../src/domain/entities/transaction";

describe("Transaction Entity", () => {
	describe("create", () => {
		it("should create transaction with default PENDING status", () => {
			const txn = Transaction.create(
				"id-123",
				"user-456",
				100.5,
				Currency.USD,
				"Test description"
			);

			expect(txn.id).toBe("id-123");
			expect(txn.userId).toBe("user-456");
			expect(txn.amount).toBe(100.5);
			expect(txn.currency).toBe(Currency.USD);
			expect(txn.status).toBe(TransactionStatus.PENDING);
			expect(txn.description).toBe("Test description");
			expect(txn.createdAt).toBeInstanceOf(Date);
			expect(txn.updatedAt).toBeInstanceOf(Date);
		});

		it("should create transaction without description", () => {
			const txn = Transaction.create("id-123", "user-456", 100, Currency.EUR);

			expect(txn.description).toBeUndefined();
		});
	});

	describe("update", () => {
		it("should update status and updatedAt", () => {
			const txn = Transaction.create("id-123", "user-456", 100, Currency.USD);
			const originalUpdatedAt = txn.updatedAt;

			setTimeout(() => {
				txn.update(TransactionStatus.COMPLETED);

				expect(txn.status).toBe(TransactionStatus.COMPLETED);
				expect(txn.updatedAt.getTime()).toBeGreaterThan(
					originalUpdatedAt.getTime()
				);
			}, 10);
		});

		it("should update updatedAt even without status change", () => {
			const txn = Transaction.create("id-123", "user-456", 100, Currency.USD);
			const originalUpdatedAt = txn.updatedAt;

			setTimeout(() => {
				txn.update();

				expect(txn.updatedAt.getTime()).toBeGreaterThan(
					originalUpdatedAt.getTime()
				);
			}, 10);
		});
	});

	describe("canBeDeleted", () => {
		it("should allow deletion of PENDING transaction", () => {
			const txn = Transaction.create("id-123", "user-456", 100, Currency.USD);

			expect(txn.canBeDeleted()).toBe(true);
		});

		it("should allow deletion of FAILED transaction", () => {
			const txn = Transaction.create("id-123", "user-456", 100, Currency.USD);
			txn.update(TransactionStatus.FAILED);

			expect(txn.canBeDeleted()).toBe(true);
		});

		it("should allow deletion of CANCELLED transaction", () => {
			const txn = Transaction.create("id-123", "user-456", 100, Currency.USD);
			txn.update(TransactionStatus.CANCELLED);

			expect(txn.canBeDeleted()).toBe(true);
		});

		it("should NOT allow deletion of COMPLETED transaction", () => {
			const txn = Transaction.create("id-123", "user-456", 100, Currency.USD);
			txn.update(TransactionStatus.COMPLETED);

			expect(txn.canBeDeleted()).toBe(false);
		});
	});
});
