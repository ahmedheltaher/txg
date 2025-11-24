import { Op } from "sequelize";
import {
	OutboxEvent,
	OutboxEventStatus,
} from "../../../domain/entities/outbox-event";
import { IOutboxRepository } from "../../../domain/repositories/outbox-repository.port";
import { OutboxModel } from "../models/outbox.model";

export class OutboxRepository implements IOutboxRepository {
	async create(event: OutboxEvent): Promise<OutboxEvent> {
		const model = await OutboxModel.create({
			id: event.id,
			aggregateId: event.aggregateId,
			eventType: event.eventType,
			payload: event.payload,
			status: event.status,
			createdAt: event.createdAt,
			processedAt: event.processedAt,
			retryCount: event.retryCount,
		});

		return this.toDomain(model);
	}

	async findPendingEvents(limit: number): Promise<OutboxEvent[]> {
		const models = await OutboxModel.findAll({
			where: {
				status: OutboxEventStatus.PENDING,
				retryCount: { [Op.lt]: 3 },
			},
			limit,
			order: [["createdAt", "ASC"]],
		});

		return models.map((m) => this.toDomain(m));
	}

	async update(event: OutboxEvent): Promise<void> {
		await OutboxModel.update(
			{
				status: event.status,
				processedAt: event.processedAt,
				retryCount: event.retryCount,
			},
			{
				where: { id: event.id },
			}
		);
	}

	private toDomain(model: OutboxModel): OutboxEvent {
		return new OutboxEvent(
			model.id,
			model.aggregateId,
			model.eventType,
			model.payload,
			model.status as OutboxEventStatus,
			model.createdAt,
			model.processedAt,
			model.retryCount
		);
	}
}
