import { AuditLog } from "../entities/audit-log";

export interface AuditLogFilters {
	userId?: string;
	aggregateId?: string;
	aggregateType?: string;
	action?: string;
	status?: string;
	startDate?: Date;
	endDate?: Date;
}

export interface IAuditLogRepository {
	create(auditLog: AuditLog): Promise<AuditLog>;
	findById(id: string): Promise<AuditLog | null>;
	findByEventId(eventId: string): Promise<AuditLog | null>;
	findAll(
		filters: AuditLogFilters,
		limit: number,
		offset: number
	): Promise<AuditLog[]>;
	count(filters: AuditLogFilters): Promise<number>;
}
