import { TransactionEventType } from "../../src/events/transaction-events";
import { EventValidator } from "../../src/validators/event-validator";

describe("EventValidator", () => {
	describe("validateTransactionCreated", () => {
		it("should validate correct event", () => {
			const event = {
				eventId: "123e4567-e89b-12d3-a456-426614174000",
				aggregateId: "123e4567-e89b-12d3-a456-426614174001",
				eventType: TransactionEventType.TRANSACTION_CREATED,
				timestamp: new Date().toISOString(),
				version: "1.0.0",
				payload: {
					transactionId: "123e4567-e89b-12d3-a456-426614174001",
					userId: "123e4567-e89b-12d3-a456-426614174002",
					amount: 100.5,
					currency: "USD",
					status: "PENDING",
					action: "CREATE" as const,
					createdAt: new Date().toISOString(),
				},
			};

			expect(EventValidator.validateTransactionCreated(event)).toBe(true);
		});

		it("should reject invalid event", () => {
			const event = {
				eventId: "invalid-uuid",
				aggregateId: "123e4567-e89b-12d3-a456-426614174001",
				eventType: TransactionEventType.TRANSACTION_CREATED,
			};

			expect(EventValidator.validateTransactionCreated(event)).toBe(false);
		});
	});
});
