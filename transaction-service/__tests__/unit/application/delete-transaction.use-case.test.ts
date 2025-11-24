import { DeleteTransactionUseCase } from "../../../src/application/use-cases/delete-transaction";
import {
	Currency,
	Transaction,
	TransactionStatus,
} from "../../../src/domain/entities/transaction";
import {
	AuthorizationError,
	BusinessRuleError,
	NotFoundError,
} from "../../../src/domain/errors/custom-errors";
import { IOutboxRepository } from "../../../src/domain/repositories/outbox-repository.port";
import { ITransactionRepository } from "../../../src/domain/repositories/transaction-repository.port";

describe("DeleteTransactionUseCase", () => {
	let useCase: DeleteTransactionUseCase;
	let mockTransactionRepo: jest.Mocked<ITransactionRepository>;
	let mockOutboxRepo: jest.Mocked<IOutboxRepository>;
	let mockSequelize: any;

	beforeEach(() => {
		mockTransactionRepo = {
			create: jest.fn(),
			findById: jest.fn(),
			findByUserId: jest.fn(),
			findAll: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
			count: jest.fn(),
		};

		mockOutboxRepo = {
			create: jest.fn(),
			findPendingEvents: jest.fn(),
			update: jest.fn(),
		};

		mockSequelize = {
			transaction: jest.fn().mockResolvedValue({
				commit: jest.fn(),
				rollback: jest.fn(),
			}),
		};

		useCase = new DeleteTransactionUseCase(
			mockTransactionRepo,
			mockOutboxRepo,
			mockSequelize
		);
	});

	it("should throw NotFoundError when transaction doesn't exist", async () => {
		mockTransactionRepo.findById.mockResolvedValue(null);

		await expect(useCase.execute("txn-123", "user-456")).rejects.toThrow(
			NotFoundError
		);
	});

	it("should throw AuthorizationError when user doesn't own transaction", async () => {
		const transaction = Transaction.create(
			"txn-123",
			"other-user",
			100,
			Currency.USD
		);
		mockTransactionRepo.findById.mockResolvedValue(transaction);

		await expect(useCase.execute("txn-123", "user-456")).rejects.toThrow(
			AuthorizationError
		);
	});

	it("should throw BusinessRuleError when trying to delete completed transaction", async () => {
		const transaction = Transaction.create(
			"txn-123",
			"user-456",
			100,
			Currency.USD
		);
		transaction.update(TransactionStatus.COMPLETED);
		mockTransactionRepo.findById.mockResolvedValue(transaction);

		await expect(useCase.execute("txn-123", "user-456")).rejects.toThrow(
			BusinessRuleError
		);
	});

	it("should successfully delete pending transaction", async () => {
		const transaction = Transaction.create(
			"txn-123",
			"user-456",
			100,
			Currency.USD
		);
		mockTransactionRepo.findById.mockResolvedValue(transaction);
		mockTransactionRepo.delete.mockResolvedValue(undefined);
		mockOutboxRepo.create.mockResolvedValue({} as any);

		await useCase.execute("txn-123", "user-456");

		expect(mockTransactionRepo.delete).toHaveBeenCalledWith("txn-123");
		expect(mockOutboxRepo.create).toHaveBeenCalled();
	});
});
