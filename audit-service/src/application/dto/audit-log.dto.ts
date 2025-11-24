export interface CreateAuditLogDTO {
	eventId: string;
	aggregateId: string;
	aggregateType: string;
	action: string;
	userId: string;
	metadata: object;
	ipAddress?: string;
	userAgent?: string;
}

export interface AuditLogResponseDTO {
	id: string;
	eventId: string;
	aggregateId: string;
	aggregateType: string;
	action: string;
	userId: string;
	status: string;
	metadata: object;
	createdAt: Date;
	ipAddress?: string;
	userAgent?: string;
}

export interface QueryAuditLogsDTO {
	userId?: string;
	aggregateId?: string;
	aggregateType?: string;
	action?: string;
	status?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}

export interface PaginatedAuditLogsDTO {
	data: AuditLogResponseDTO[];
	total: number;
	page: number;
	limit: number;
}
