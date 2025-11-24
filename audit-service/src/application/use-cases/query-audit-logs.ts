import { AuditLog } from "../../domain/entities/audit-log";
import { ValidationError } from "../../domain/errors/custom-errors";
import {
	AuditLogFilters,
	IAuditLogRepository,
} from "../../domain/repositories/audit-log-repository.port";
import {
	AuditLogResponseDTO,
	PaginatedAuditLogsDTO,
	QueryAuditLogsDTO,
} from "../dto/audit-log.dto";

export class QueryAuditLogsUseCase {
	constructor(private auditLogRepo: IAuditLogRepository) {}

	async execute(query: QueryAuditLogsDTO): Promise<PaginatedAuditLogsDTO> {
		this.validateQueryDTO(query);

		const page = query.page || 1;
		const limit = query.limit || 10;
		const offset = (page - 1) * limit;

		const filters: AuditLogFilters = {
			userId: query.userId,
			aggregateId: query.aggregateId,
			aggregateType: query.aggregateType,
			action: query.action,
			status: query.status,
			startDate: query.startDate ? new Date(query.startDate) : undefined,
			endDate: query.endDate ? new Date(query.endDate) : undefined,
		};

		const [logs, total] = await Promise.all([
			this.auditLogRepo.findAll(filters, limit, offset),
			this.auditLogRepo.count(filters),
		]);

		return {
			data: logs.map((log) => this.toDTO(log)),
			total,
			page,
			limit,
		};
	}

	private validateQueryDTO(query: QueryAuditLogsDTO): void {
		const errors: { message: string; field?: string }[] = [];

		if (
			query.page != null &&
			(query.page < 1 || !Number.isInteger(query.page))
		) {
			errors.push({
				message: "Page must be a positive integer",
				field: "page",
			});
		}

		if (
			query.limit != null &&
			(query.limit < 1 || query.limit > 100 || !Number.isInteger(query.limit))
		) {
			errors.push({
				message: "Limit must be an integer between 1 and 100",
				field: "limit",
			});
		}

		if (query.startDate && isNaN(Date.parse(query.startDate))) {
			errors.push({
				message: "Start date must be a valid date",
				field: "startDate",
			});
		}

		if (query.endDate && isNaN(Date.parse(query.endDate))) {
			errors.push({
				message: "End date must be a valid date",
				field: "endDate",
			});
		}

		if (query.startDate && query.endDate) {
			const start = new Date(query.startDate);
			const end = new Date(query.endDate);
			if (start > end) {
				errors.push({
					message: "Start date must be before end date",
					field: "startDate",
				});
			}
		}

		if (errors.length > 0) {
			throw new ValidationError(errors);
		}
	}

	private toDTO(auditLog: AuditLog): AuditLogResponseDTO {
		return {
			id: auditLog.id,
			eventId: auditLog.eventId,
			aggregateId: auditLog.aggregateId,
			aggregateType: auditLog.aggregateType,
			action: auditLog.action,
			userId: auditLog.userId,
			status: auditLog.status,
			metadata: auditLog.metadata,
			createdAt: auditLog.createdAt,
			ipAddress: auditLog.ipAddress,
			userAgent: auditLog.userAgent,
		};
	}
}
