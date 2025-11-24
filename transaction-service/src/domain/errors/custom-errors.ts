export abstract class ApplicationError extends Error {
	public abstract readonly statusCode: number;
	public readonly code: string;

	constructor(message: string, code: string) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class ValidationError extends ApplicationError {
	public readonly statusCode = 400;
	constructor(message: string, code: string = "VALIDATION_ERROR") {
		super(message, code);
	}
}

export class AuthenticationError extends ApplicationError {
	public readonly statusCode = 401;
	constructor(
		message: string = "Unauthorized",
		code: string = "AUTHENTICATION_ERROR"
	) {
		super(message, code);
	}
}

export class AuthorizationError extends ApplicationError {
	public readonly statusCode = 403;
	constructor(
		message: string = "Forbidden",
		code: string = "AUTHORIZATION_ERROR"
	) {
		super(message, code);
	}
}

export class NotFoundError extends ApplicationError {
	public readonly statusCode = 404;
	constructor(resource: string = "Resource", code: string = "NOT_FOUND") {
		super(`${resource} not found`, code);
	}
}

export class BusinessRuleError extends ApplicationError {
	public readonly statusCode = 422;
	constructor(message: string, code: string = "BUSINESS_RULE") {
		super(message, code);
	}
}

export class DatabaseError extends ApplicationError {
	public readonly statusCode = 500;
	constructor(message: string, code: string = "DATABASE_ERROR") {
		super(message, code);
	}
}
