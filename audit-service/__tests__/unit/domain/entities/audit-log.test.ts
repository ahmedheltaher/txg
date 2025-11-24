import {
	AuditAction,
	AuditLog,
	AuditStatus,
} from "../../../../src/domain/entities/audit-log";

describe("AuditLog Entity", () => {
	const mockAuditLogData = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		eventId: "123e4567-e89b-12d3-a456-426614174001",
		aggregateId: "123e4567-e89b-12d3-a456-426614174002",
		aggregateType: "TRANSACTION",
		action: AuditAction.CREATE,
		userId: "123e4567-e89b-12d3-a456-426614174003",
		metadata: { amount: 100 },
		ipAddress: "192.168.1.1",
		userAgent: "Mozilla/5.0",
	};

	describe("create", () => {
		it("should create an audit log with SUCCESS status", () => {
			const auditLog = AuditLog.create(
				mockAuditLogData.id,
				mockAuditLogData.eventId,
				mockAuditLogData.aggregateId,
				mockAuditLogData.aggregateType,
				mockAuditLogData.action,
				mockAuditLogData.userId,
				mockAuditLogData.metadata,
				mockAuditLogData.ipAddress,
				mockAuditLogData.userAgent
			);

			expect(auditLog.id).toBe(mockAuditLogData.id);
			expect(auditLog.eventId).toBe(mockAuditLogData.eventId);
			expect(auditLog.aggregateId).toBe(mockAuditLogData.aggregateId);
			expect(auditLog.aggregateType).toBe(mockAuditLogData.aggregateType);
			expect(auditLog.action).toBe(mockAuditLogData.action);
			expect(auditLog.userId).toBe(mockAuditLogData.userId);
			expect(auditLog.status).toBe(AuditStatus.SUCCESS);
			expect(auditLog.metadata).toEqual(mockAuditLogData.metadata);
			expect(auditLog.ipAddress).toBe(mockAuditLogData.ipAddress);
			expect(auditLog.userAgent).toBe(mockAuditLogData.userAgent);
			expect(auditLog.createdAt).toBeInstanceOf(Date);
		});
	});

	describe("status management", () => {
		it("should mark audit log as failed", () => {
			const auditLog = AuditLog.create(
				mockAuditLogData.id,
				mockAuditLogData.eventId,
				mockAuditLogData.aggregateId,
				mockAuditLogData.aggregateType,
				mockAuditLogData.action,
				mockAuditLogData.userId,
				mockAuditLogData.metadata
			);

			auditLog.markAsFailed();

			expect(auditLog.status).toBe(AuditStatus.FAILED);
		});

		it("should mark audit log as rolled back", () => {
			const auditLog = AuditLog.create(
				mockAuditLogData.id,
				mockAuditLogData.eventId,
				mockAuditLogData.aggregateId,
				mockAuditLogData.aggregateType,
				mockAuditLogData.action,
				mockAuditLogData.userId,
				mockAuditLogData.metadata
			);

			auditLog.markAsRolledBack();

			expect(auditLog.status).toBe(AuditStatus.ROLLED_BACK);
		});
	});
});
