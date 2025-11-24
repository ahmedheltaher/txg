import { AuditAction, AuditStatus } from "@txg/shared-contracts";

export { AuditAction, AuditStatus };

export class AuditLog {
	constructor(
		public readonly id: string,
		public readonly eventId: string,
		public readonly aggregateId: string,
		public readonly aggregateType: string,
		public readonly action: AuditAction,
		public readonly userId: string,
		public status: AuditStatus,
		public readonly metadata: object,
		public readonly createdAt: Date,
		public readonly ipAddress?: string,
		public readonly userAgent?: string
	) {}

	static create(
		id: string,
		eventId: string,
		aggregateId: string,
		aggregateType: string,
		action: AuditAction,
		userId: string,
		metadata: object,
		ipAddress?: string,
		userAgent?: string
	): AuditLog {
		return new AuditLog(
			id,
			eventId,
			aggregateId,
			aggregateType,
			action,
			userId,
			AuditStatus.SUCCESS,
			metadata,
			new Date(),
			ipAddress,
			userAgent
		);
	}

	markAsFailed(): void {
		this.status = AuditStatus.FAILED;
	}

	markAsRolledBack(): void {
		this.status = AuditStatus.ROLLED_BACK;
	}
}
