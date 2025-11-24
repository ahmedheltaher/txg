import { QueryAuditLogsUseCase } from "../../../../src/application/use-cases/query-audit-logs";
import {
	AuditAction,
	AuditLog,
} from "../../../../src/domain/entities/audit-log";
import { ValidationError } from "../../../../src/domain/errors/custom-errors";
import { IAuditLogRepository } from "../../../../src/domain/repositories/audit-log-repository.port";

describe("QueryAuditLogsUseCase", () => {
	let queryAuditLogsUseCase: QueryAuditLogsUseCase;
	let mockAuditLogRepo: jest.Mocked<IAuditLogRepository>;

	const mockAuditLog = AuditLog.create(
		"123e4567-e89b-12d3-a456-426614174000",
		"123e4567-e89b-12d3-a456-426614174001",
		"123e4567-e89b-12d3-a456-426614174002",
		"TRANSACTION",
		AuditAction.CREATE,
		"123e4567-e89b-12d3-a456-426614174003",
		{ amount: 100 }
	);

	beforeEach(() => {
		mockAuditLogRepo = {
			create: jest.fn(),
			findById: jest.fn(),
			findByEventId: jest.fn(),
			findAll: jest.fn(),
			count: jest.fn(),
		};

		queryAuditLogsUseCase = new QueryAuditLogsUseCase(mockAuditLogRepo);
	});

	describe("execute", () => {
		it("should return paginated audit logs", async () => {
			const query = { page: 1, limit: 10 };
			mockAuditLogRepo.findAll.mockResolvedValue([mockAuditLog]);
			mockAuditLogRepo.count.mockResolvedValue(1);

			const result = await queryAuditLogsUseCase.execute(query);

			expect(mockAuditLogRepo.findAll).toHaveBeenCalledWith(
				expect.any(Object),
				10,
				0
			);
			expect(mockAuditLogRepo.count).toHaveBeenCalled();
			expect(result.data).toHaveLength(1);
			expect(result.total).toBe(1);
			expect(result.page).toBe(1);
			expect(result.limit).toBe(10);
		});

		it("should apply filters correctly", async () => {
			const query = {
				userId: "user-123",
				aggregateType: "TRANSACTION",
				action: "CREATE",
				startDate: "2023-01-01T00:00:00Z",
				endDate: "2023-12-31T23:59:59Z",
			};

			mockAuditLogRepo.findAll.mockResolvedValue([mockAuditLog]);
			mockAuditLogRepo.count.mockResolvedValue(1);

			await queryAuditLogsUseCase.execute(query);

			expect(mockAuditLogRepo.findAll).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: "user-123",
					aggregateType: "TRANSACTION",
					action: "CREATE",
					startDate: new Date("2023-01-01T00:00:00Z"),
					endDate: new Date("2023-12-31T23:59:59Z"),
				}),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it("should throw ValidationError for invalid page", async () => {
			const query = { page: 0 };

			await expect(queryAuditLogsUseCase.execute(query)).rejects.toThrow(
				ValidationError
			);
		});

		it("should throw ValidationError for invalid limit", async () => {
			const query = { limit: 0 };

			await expect(queryAuditLogsUseCase.execute(query)).rejects.toThrow(
				ValidationError
			);
		});

		it("should throw ValidationError for invalid date range", async () => {
			const query = {
				startDate: "2023-12-31T00:00:00Z",
				endDate: "2023-01-01T00:00:00Z",
			};

			await expect(queryAuditLogsUseCase.execute(query)).rejects.toThrow(
				ValidationError
			);
		});
	});
});
