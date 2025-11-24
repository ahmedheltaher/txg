export interface BaseEvent {
	eventId: string;
	aggregateId: string;
	eventType: string;
	timestamp: string;
	version: string;
}
