import { CreateAuditLogUseCase } from "../../../../src/application/use-cases/create-audit-log";
import {
	AuditAction,
	AuditLog,
} from "../../../../src/domain/entities/audit-log";
import { ValidationError } from "../../../../src/domain/errors/custom-errors";
import { IAuditLogRepository } from "../../../../src/domain/repositories/audit-log-repository.port";

describe("CreateAuditLogUseCase", () => {
	let createAuditLogUseCase: CreateAuditLogUseCase;
	let mockAuditLogRepo: jest.Mocked<IAuditLogRepository>;

	const mockAuditLogDTO = {
		eventId: "123e4567-e89b-12d3-a456-426614174001",
		aggregateId: "123e4567-e89b-12d3-a456-426614174002",
		aggregateType: "TRANSACTION",
		action: "CREATE",
		userId: "123e4567-e89b-12d3-a456-426614174003",
		metadata: { amount: 100 },
		ipAddress: "192.168.1.1",
		userAgent: "Mozilla/5.0",
	};

	const mockAuditLog = AuditLog.create(
		"123e4567-e89b-12d3-a456-426614174000",
		mockAuditLogDTO.eventId,
		mockAuditLogDTO.aggregateId,
		mockAuditLogDTO.aggregateType,
		AuditAction.CREATE,
		mockAuditLogDTO.userId,
		mockAuditLogDTO.metadata,
		mockAuditLogDTO.ipAddress,
		mockAuditLogDTO.userAgent
	);

	beforeEach(() => {
		mockAuditLogRepo = {
			create: jest.fn(),
			findById: jest.fn(),
			findByEventId: jest.fn(),
			findAll: jest.fn(),
			count: jest.fn(),
		};

		createAuditLogUseCase = new CreateAuditLogUseCase(mockAuditLogRepo);
	});

	describe("execute", () => {
		it("should create a new audit log successfully", async () => {
			mockAuditLogRepo.findByEventId.mockResolvedValue(null);
			mockAuditLogRepo.create.mockResolvedValue(mockAuditLog);

			const result = await createAuditLogUseCase.execute(mockAuditLogDTO);

			expect(mockAuditLogRepo.findByEventId).toHaveBeenCalledWith(
				mockAuditLogDTO.eventId
			);
			expect(mockAuditLogRepo.create).toHaveBeenCalled();
			expect(result.eventId).toBe(mockAuditLogDTO.eventId);
			expect(result.aggregateId).toBe(mockAuditLogDTO.aggregateId);
			expect(result.action).toBe(mockAuditLogDTO.action);
		});

		it("should return existing audit log when event already exists", async () => {
			mockAuditLogRepo.findByEventId.mockResolvedValue(mockAuditLog);

			const result = await createAuditLogUseCase.execute(mockAuditLogDTO);

			expect(mockAuditLogRepo.findByEventId).toHaveBeenCalledWith(
				mockAuditLogDTO.eventId
			);
			expect(mockAuditLogRepo.create).not.toHaveBeenCalled();
			expect(result.eventId).toBe(mockAuditLogDTO.eventId);
		});

		it("should throw ValidationError for invalid DTO", async () => {
			const invalidDTO = { ...mockAuditLogDTO, eventId: "" };

			await expect(createAuditLogUseCase.execute(invalidDTO)).rejects.toThrow(
				ValidationError
			);
		});

		it("should handle database errors", async () => {
			mockAuditLogRepo.findByEventId.mockResolvedValue(null);
			mockAuditLogRepo.create.mockRejectedValue(new Error("Database error"));

			await expect(
				createAuditLogUseCase.execute(mockAuditLogDTO)
			).rejects.toThrow();
		});
	});

	describe("validation", () => {
		it("should validate required fields", async () => {
			const invalidDTO = { ...mockAuditLogDTO, eventId: undefined as any };

			await expect(createAuditLogUseCase.execute(invalidDTO)).rejects.toThrow(
				ValidationError
			);
		});

		it("should validate action enum", async () => {
			const invalidDTO = { ...mockAuditLogDTO, action: "INVALID_ACTION" };

			await expect(createAuditLogUseCase.execute(invalidDTO)).rejects.toThrow(
				ValidationError
			);
		});

		it("should validate metadata object", async () => {
			const invalidDTO = { ...mockAuditLogDTO, metadata: "invalid" as any };

			await expect(createAuditLogUseCase.execute(invalidDTO)).rejects.toThrow(
				ValidationError
			);
		});
	});
});
