import { BaseEvent } from "./base-event";

export enum TransactionEventType {
	TRANSACTION_CREATED = "TRANSACTION_CREATED",
	TRANSACTION_UPDATED = "TRANSACTION_UPDATED",
	TRANSACTION_DELETED = "TRANSACTION_DELETED",
}

export interface TransactionCreatedPayload {
	transactionId: string;
	userId: string;
	amount: number;
	currency: string;
	status: string;
	description?: string;
	action: "CREATE";
	createdAt: string;
}

export interface TransactionUpdatedPayload {
	transactionId: string;
	userId: string;
	oldStatus: string;
	newStatus: string;
	action: "UPDATE";
	updatedAt: string;
}

export interface TransactionDeletedPayload {
	transactionId: string;
	userId: string;
	action: "DELETE";
	deletedAt: string;
}

export interface TransactionCreatedEvent extends BaseEvent {
	eventType: TransactionEventType.TRANSACTION_CREATED;
	payload: TransactionCreatedPayload;
}

export interface TransactionUpdatedEvent extends BaseEvent {
	eventType: TransactionEventType.TRANSACTION_UPDATED;
	payload: TransactionUpdatedPayload;
}

export interface TransactionDeletedEvent extends BaseEvent {
	eventType: TransactionEventType.TRANSACTION_DELETED;
	payload: TransactionDeletedPayload;
}

export type TransactionEvent =
	| TransactionCreatedEvent
	| TransactionUpdatedEvent
	| TransactionDeletedEvent;
