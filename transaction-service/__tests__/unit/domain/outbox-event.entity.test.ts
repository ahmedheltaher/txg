import {
	OutboxEvent,
	OutboxEventStatus,
} from "../../../src/domain/entities/outbox-event";

describe("OutboxEvent Entity", () => {
	describe("create", () => {
		it("should create event with PENDING status", () => {
			const payload = { test: "data" };
			const event = OutboxEvent.create(
				"event-123",
				"aggregate-456",
				"TEST_EVENT",
				payload
			);

			expect(event.id).toBe("event-123");
			expect(event.aggregateId).toBe("aggregate-456");
			expect(event.eventType).toBe("TEST_EVENT");
			expect(event.payload).toEqual(payload);
			expect(event.status).toBe(OutboxEventStatus.PENDING);
			expect(event.retryCount).toBe(0);
			expect(event.processedAt).toBeUndefined();
			expect(event.createdAt).toBeInstanceOf(Date);
		});
	});

	describe("markAsProcessed", () => {
		it("should mark event as processed with timestamp", () => {
			const event = OutboxEvent.create("id", "agg", "TYPE", {});

			event.markAsProcessed();

			expect(event.status).toBe(OutboxEventStatus.PROCESSED);
			expect(event.processedAt).toBeInstanceOf(Date);
		});
	});

	describe("markAsFailed", () => {
		it("should mark event as failed and increment retry count", () => {
			const event = OutboxEvent.create("id", "agg", "TYPE", {});

			event.markAsFailed();

			expect(event.status).toBe(OutboxEventStatus.FAILED);
			expect(event.retryCount).toBe(1);
		});

		it("should increment retry count on each failure", () => {
			const event = OutboxEvent.create("id", "agg", "TYPE", {});

			event.markAsFailed();
			event.markAsFailed();
			event.markAsFailed();

			expect(event.retryCount).toBe(3);
		});
	});
});
