import { OutboxEvent } from "../entities/outbox-event";

export interface IOutboxRepository {
	create(event: OutboxEvent): Promise<OutboxEvent>;
	findPendingEvents(limit: number): Promise<OutboxEvent[]>;
	update(event: OutboxEvent): Promise<void>;
}
