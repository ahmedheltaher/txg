import { Op, WhereOptions } from "sequelize";
import {
	AuditAction,
	AuditLog,
	AuditStatus,
} from "../../../domain/entities/audit-log";
import {
	DatabaseError,
	DuplicateEventError,
} from "../../../domain/errors/custom-errors";
import {
	AuditLogFilters,
	IAuditLogRepository,
} from "../../../domain/repositories/audit-log-repository.port";
import { AuditLogModel } from "../models/audit-log.model";

export class AuditLogRepository implements IAuditLogRepository {
	async create(auditLog: AuditLog): Promise<AuditLog> {
		try {
			const model = await AuditLogModel.create({
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
			});

			return this.toDomain(model);
		} catch (error: any) {
			if (error.name === "SequelizeUniqueConstraintError") {
				throw new DuplicateEventError(auditLog.eventId);
			}
			throw new DatabaseError(error);
		}
	}

	async findById(id: string): Promise<AuditLog | null> {
		try {
			const model = await AuditLogModel.findByPk(id);
			return model ? this.toDomain(model) : null;
		} catch (error: any) {
			throw new DatabaseError(error);
		}
	}

	async findByEventId(eventId: string): Promise<AuditLog | null> {
		try {
			const model = await AuditLogModel.findOne({ where: { eventId } });
			return model ? this.toDomain(model) : null;
		} catch (error: any) {
			throw new DatabaseError(error);
		}
	}

	async findAll(
		filters: AuditLogFilters,
		limit: number,
		offset: number
	): Promise<AuditLog[]> {
		try {
			const where = this.buildWhereClause(filters);

			const models = await AuditLogModel.findAll({
				where,
				limit,
				offset,
				order: [["createdAt", "DESC"]],
			});

			return models.map((m) => this.toDomain(m));
		} catch (error: any) {
			throw new DatabaseError(error);
		}
	}

	async count(filters: AuditLogFilters): Promise<number> {
		try {
			const where = this.buildWhereClause(filters);
			return AuditLogModel.count({ where });
		} catch (error: any) {
			throw new DatabaseError(error);
		}
	}

	private buildWhereClause(filters: AuditLogFilters): WhereOptions {
		const where: WhereOptions = {};

		if (filters.userId) {
			where.userId = filters.userId;
		}

		if (filters.aggregateId) {
			where.aggregateId = filters.aggregateId;
		}

		if (filters.aggregateType) {
			where.aggregateType = filters.aggregateType;
		}

		if (filters.action) {
			where.action = filters.action;
		}

		if (filters.status) {
			where.status = filters.status;
		}

		if (filters.startDate || filters.endDate) {
			where.createdAt = {};
			if (filters.startDate) {
				where.createdAt[Op.gte] = filters.startDate;
			}
			if (filters.endDate) {
				where.createdAt[Op.lte] = filters.endDate;
			}
		}

		return where;
	}

	private toDomain(model: AuditLogModel): AuditLog {
		return new AuditLog(
			model.id,
			model.eventId,
			model.aggregateId,
			model.aggregateType,
			model.action as AuditAction,
			model.userId,
			model.status as AuditStatus,
			model.metadata,
			model.createdAt,
			model.ipAddress,
			model.userAgent
		);
	}
}
