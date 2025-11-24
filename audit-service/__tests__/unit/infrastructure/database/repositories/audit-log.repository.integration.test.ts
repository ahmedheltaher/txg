import {
	AuditAction,
	AuditLog,
	AuditStatus,
} from "../../../../../src/domain/entities/audit-log";
import { DuplicateEventError } from "../../../../../src/domain/errors/custom-errors";
import { AuditLogModel } from "../../../../../src/infrastructure/database/models/audit-log.model";
import { AuditLogRepository } from "../../../../../src/infrastructure/database/repositories/audit-log.repository";
import { sequelize } from "../../../../../src/infrastructure/database/sequelize";

describe("AuditLogRepository Integration Tests", () => {
	let auditLogRepository: AuditLogRepository;

	const mockAuditLog = AuditLog.create(
		"123e4567-e89b-12d3-a456-426614174000",
		"123e4567-e89b-12d3-a456-426614174001",
		"123e4567-e89b-12d3-a456-426614174002",
		"TRANSACTION",
		AuditAction.CREATE,
		"123e4567-e89b-12d3-a456-426614174003",
		{ amount: 100 },
		"192.168.1.1",
		"Mozilla/5.0"
	);

	beforeAll(async () => {
		await sequelize.sync({ force: true });
		auditLogRepository = new AuditLogRepository();
	});

	afterEach(async () => {
		await AuditLogModel.destroy({ where: {} });
	});

	afterAll(async () => {
		await sequelize.close();
	});

	describe("create", () => {
		it("should create an audit log successfully", async () => {
			const result = await auditLogRepository.create(mockAuditLog);

			expect(result.id).toBe(mockAuditLog.id);
			expect(result.eventId).toBe(mockAuditLog.eventId);
			expect(result.aggregateId).toBe(mockAuditLog.aggregateId);
			expect(result.action).toBe(mockAuditLog.action);
			expect(result.status).toBe(AuditStatus.SUCCESS);

			const dbRecord = await AuditLogModel.findByPk(mockAuditLog.id);
			expect(dbRecord).not.toBeNull();
			expect(dbRecord?.eventId).toBe(mockAuditLog.eventId);
		});

		it("should throw DuplicateEventError for duplicate event ID", async () => {
			await auditLogRepository.create(mockAuditLog);

			await expect(auditLogRepository.create(mockAuditLog)).rejects.toThrow(
				DuplicateEventError
			);
		});
	});

	describe("findByEventId", () => {
		it("should find audit log by event ID", async () => {
			await auditLogRepository.create(mockAuditLog);

			const result = await auditLogRepository.findByEventId(
				mockAuditLog.eventId
			);

			expect(result).not.toBeNull();
			expect(result?.eventId).toBe(mockAuditLog.eventId);
			expect(result?.id).toBe(mockAuditLog.id);
		});

		it("should return null for non-existent event ID", async () => {
			const result = await auditLogRepository.findByEventId(
				"123e4567-e89b-12d3-a456-426614174000"
			);

			expect(result).toBeNull();
		});
	});

	describe("findAll and count", () => {
		beforeEach(async () => {
			const auditLogs = [
				AuditLog.create(
					"123e4567-e89b-12d3-a456-426614174000",
					"223e4567-e89b-12d3-a456-426614174000",
					"123e4567-e89b-12d3-a456-426614174001",
					"TRANSACTION",
					AuditAction.CREATE,
					"143e4567-e89b-12d3-a456-426614174000",
					{ amount: 100 }
				),
				AuditLog.create(
					"234e4567-e89b-12d3-a456-426614174000",
					"223e4567-e89b-12d3-a456-426614174003",
					"123e4567-e89b-12d3-a456-426614174001",
					"TRANSACTION",
					AuditAction.UPDATE,
					"143e4567-e89b-12d3-a456-426614174045",
					{ amount: 200 }
				),
				AuditLog.create(
					"345e4567-e89b-12d3-a456-426614174000",
					"223e4567-e89b-12d3-a456-426614174002",
					"123e4567-e89b-12d3-a456-426614174002",
					"USER",
					AuditAction.CREATE,
					"143e4567-e89b-12d3-a456-426614174000",
					{ action: "login" }
				),
			];

			for (const log of auditLogs) {
				await auditLogRepository.create(log);
			}
		});

		it("should return all audit logs with pagination", async () => {
			const [logs, total] = await Promise.all([
				auditLogRepository.findAll({}, 10, 0),
				auditLogRepository.count({}),
			]);

			expect(logs).toHaveLength(3);
			expect(total).toBe(3);
		});

		it("should filter by user ID", async () => {
			const [logs, total] = await Promise.all([
				auditLogRepository.findAll(
					{ userId: "143e4567-e89b-12d3-a456-426614174000" },
					10,
					0
				),
				auditLogRepository.count({
					userId: "143e4567-e89b-12d3-a456-426614174000",
				}),
			]);

			expect(logs).toHaveLength(2);
			expect(total).toBe(2);
			expect(
				logs.every(
					(log) => log.userId === "143e4567-e89b-12d3-a456-426614174000"
				)
			).toBe(true);
		});

		it("should filter by aggregate type", async () => {
			const [logs, total] = await Promise.all([
				auditLogRepository.findAll({ aggregateType: "TRANSACTION" }, 10, 0),
				auditLogRepository.count({ aggregateType: "TRANSACTION" }),
			]);

			expect(logs).toHaveLength(2);
			expect(total).toBe(2);
			expect(logs.every((log) => log.aggregateType === "TRANSACTION")).toBe(
				true
			);
		});

		it("should apply date range filters", async () => {
			const startDate = new Date(new Date().setMinutes(-10));
			console.log("󱓞 ~ startDate:", startDate);
			const endDate = new Date(
				new Date().setMinutes(new Date().getMinutes() + 10)
			);
			console.log("󱓞 ~ endDate:", endDate);

			const [logs, total] = await Promise.all([
				auditLogRepository.findAll({ startDate, endDate }, 10, 0),
				auditLogRepository.count({ startDate, endDate }),
			]);

			expect(logs.length).toBeGreaterThan(0);
			expect(total).toBeGreaterThan(0);
		});
	});
});
