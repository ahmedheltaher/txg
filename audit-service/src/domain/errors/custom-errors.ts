export abstract class CustomError extends Error {
	abstract statusCode: number;
	abstract errorCode: string;

	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, CustomError.prototype);
	}

	abstract serializeErrors(): { message: string; field?: string }[];
}

export class ValidationError extends CustomError {
	statusCode = 400;
	errorCode = "VALIDATION_ERROR";

	constructor(public errors: { message: string; field?: string }[]) {
		super("Validation failed");
		Object.setPrototypeOf(this, ValidationError.prototype);
	}

	serializeErrors() {
		return this.errors;
	}
}

export class DatabaseError extends CustomError {
	statusCode = 503;
	errorCode = "DATABASE_ERROR";

	constructor(public originalError?: Error) {
		super("Database operation failed");
		Object.setPrototypeOf(this, DatabaseError.prototype);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}

export class DuplicateEventError extends CustomError {
	statusCode = 409;
	errorCode = "DUPLICATE_EVENT";

	constructor(eventId: string) {
		super(`Event with id ${eventId} already exists`);
		Object.setPrototypeOf(this, DuplicateEventError.prototype);
	}

	serializeErrors() {
		return [{ message: this.message }];
	}
}
