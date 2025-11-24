import {
	AggregateType,
	AuditAction,
	EventValidator,
	TransactionEvent,
	TransactionEventType,
} from "@txg/shared-contracts";
import { CreateAuditLogUseCase } from "../../application/use-cases/create-audit-log";
import { RabbitMQClient } from "./rabbit-mq-client";

export class RabbitMQConsumer {
	constructor(
		private rabbitmqClient: RabbitMQClient,
		private createAuditLogUseCase: CreateAuditLogUseCase
	) {}

	async start(): Promise<void> {
		const exchangeName = "transaction.events";
		const queueName = "audit.transaction.events";
		const routingKeys = [
			TransactionEventType.TRANSACTION_CREATED,
			TransactionEventType.TRANSACTION_UPDATED,
			TransactionEventType.TRANSACTION_DELETED,
		];

		await this.rabbitmqClient.consume(
			exchangeName,
			queueName,
			routingKeys,
			this.handleMessage.bind(this)
		);
	}

	private async handleMessage(message: unknown): Promise<void> {
		console.log("Received message:", JSON.stringify(message, null, 2));

		if (!EventValidator.validateTransactionEvent(message)) {
			console.error("Invalid event structure received:", message);
			throw new Error("Invalid event structure - event rejected");
		}

		const event = message as TransactionEvent;

		const action = this.mapPayloadActionToAuditAction(event.payload.action);

		await this.createAuditLogUseCase.execute({
			eventId: event.eventId,
			aggregateId: event.aggregateId,
			aggregateType: AggregateType.TRANSACTION,
			action,
			userId: event.payload.userId,
			metadata: {
				eventType: event.eventType,
				version: event.version,
				timestamp: event.timestamp,
				...event.payload,
			},
		});

		console.log(
			`Audit log created for event: ${event.eventId} (${event.eventType})`
		);
	}

	private mapPayloadActionToAuditAction(action: string): AuditAction {
		const actionMap: Record<string, AuditAction> = {
			CREATE: AuditAction.CREATE,
			UPDATE: AuditAction.UPDATE,
			DELETE: AuditAction.DELETE,
		};

		const mappedAction = actionMap[action];
		if (!mappedAction) {
			throw new Error(`Unknown action: ${action}`);
		}

		return mappedAction;
	}
}
