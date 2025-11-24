import { v4 as uuidv4 } from "uuid";
import { AuditAction, AuditLog } from "../../domain/entities/audit-log";
import {
	DuplicateEventError,
	ValidationError,
} from "../../domain/errors/custom-errors";
import { IAuditLogRepository } from "../../domain/repositories/audit-log-repository.port";
import { AuditLogResponseDTO, CreateAuditLogDTO } from "../dto/audit-log.dto";

export class CreateAuditLogUseCase {
	constructor(private auditLogRepo: IAuditLogRepository) {}

	async execute(dto: CreateAuditLogDTO): Promise<AuditLogResponseDTO> {
		this.validateCreateAuditLogDTO(dto);

		try {
			const existingLog = await this.auditLogRepo.findByEventId(dto.eventId);
			if (existingLog) {
				console.log(
					`Audit log already exists for event ${dto.eventId}, returning existing (idempotency)`
				);
				return this.toDTO(existingLog);
			}

			const auditLog = AuditLog.create(
				uuidv4(),
				dto.eventId,
				dto.aggregateId,
				dto.aggregateType,
				dto.action as AuditAction,
				dto.userId,
				dto.metadata,
				dto.ipAddress,
				dto.userAgent
			);

			const created = await this.auditLogRepo.create(auditLog);
			return this.toDTO(created);
		} catch (error) {
			if (error instanceof DuplicateEventError) {
				console.log(
					`Duplicate event detected for ${dto.eventId}, fetching existing`
				);
				const existingLog = await this.auditLogRepo.findByEventId(dto.eventId);
				return this.toDTO(existingLog!);
			}
			throw error;
		}
	}

	private validateCreateAuditLogDTO(dto: CreateAuditLogDTO): void {
		const errors: { message: string; field?: string }[] = [];

		if (!dto.eventId) {
			errors.push({ message: "Event ID is required", field: "eventId" });
		}

		if (!dto.aggregateId) {
			errors.push({
				message: "Aggregate ID is required",
				field: "aggregateId",
			});
		}

		if (!dto.aggregateType) {
			errors.push({
				message: "Aggregate type is required",
				field: "aggregateType",
			});
		}

		if (!dto.action) {
			errors.push({ message: "Action is required", field: "action" });
		} else if (
			!Object.values(AuditAction).includes(dto.action as AuditAction)
		) {
			errors.push({
				message: `Action must be one of: ${Object.values(AuditAction).join(
					", "
				)}`,
				field: "action",
			});
		}

		if (!dto.userId) {
			errors.push({ message: "User ID is required", field: "userId" });
		}

		if (!dto.metadata || typeof dto.metadata !== "object") {
			errors.push({
				message: "Valid metadata object is required",
				field: "metadata",
			});
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
