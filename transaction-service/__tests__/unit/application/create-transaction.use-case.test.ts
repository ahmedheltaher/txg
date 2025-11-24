import { CreateTransactionUseCase } from "../../../src/application/use-cases/create-transaction";
import { Currency } from "../../../src/domain/entities/transaction";
import { IOutboxRepository } from "../../../src/domain/repositories/outbox-repository.port";
import { ITransactionRepository } from "../../../src/domain/repositories/transaction-repository.port";

describe("CreateTransactionUseCase", () => {
	let useCase: CreateTransactionUseCase;
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

		useCase = new CreateTransactionUseCase(
			mockTransactionRepo,
			mockOutboxRepo,
			mockSequelize
		);
	});

	it("should create transaction and outbox event", async () => {
		const mockTransaction = {
			id: "txn-123",
			userId: "user-456",
			amount: 100,
			currency: Currency.USD,
			status: "PENDING",
			createdAt: new Date(),
			updatedAt: new Date(),
			description: "Test",
		};

		mockTransactionRepo.create.mockResolvedValue(mockTransaction as any);
		mockOutboxRepo.create.mockResolvedValue({} as any);

		const dto = {
			amount: 100,
			currency: Currency.USD,
			description: "Test",
		};

		const result = await useCase.execute("user-456", dto);

		expect(mockTransactionRepo.create).toHaveBeenCalledTimes(1);
		expect(mockOutboxRepo.create).toHaveBeenCalledTimes(1);
		expect(result.amount).toBe(100);
		expect(result.currency).toBe(Currency.USD);
	});

	it("should rollback on transaction creation failure", async () => {
		const mockTxn = await mockSequelize.transaction();
		mockTransactionRepo.create.mockRejectedValue(new Error("DB Error"));

		const dto = {
			amount: 100,
			currency: Currency.USD,
		};

		await expect(useCase.execute("user-456", dto)).rejects.toThrow("DB Error");
		expect(mockTxn.rollback).toHaveBeenCalled();
	});

	it("should rollback on outbox creation failure", async () => {
		const mockTxn = await mockSequelize.transaction();
		mockTransactionRepo.create.mockResolvedValue({
			id: "txn-123",
			userId: "user-456",
			amount: 100,
			currency: Currency.USD,
			status: "PENDING",
			createdAt: new Date(),
			updatedAt: new Date(),
		} as any);

		mockOutboxRepo.create.mockRejectedValue(new Error("Outbox Error"));

		const dto = {
			amount: 100,
			currency: Currency.USD,
		};

		await expect(useCase.execute("user-456", dto)).rejects.toThrow(
			"Outbox Error"
		);
		expect(mockTxn.rollback).toHaveBeenCalled();
	});
});
