import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { CustomError } from "../../domain/errors/custom-errors";

export function errorHandler(
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply
): void {
	console.error("Error:", {
		message: error.message,
		stack: error.stack,
		url: request.url,
		method: request.method,
	});

	if (error instanceof CustomError) {
		reply.code(error.statusCode).send({
			error: error.errorCode,
			message: error.message,
			details: error.serializeErrors(),
			timestamp: new Date().toISOString(),
		});
		return;
	}

	if (error.validation) {
		reply.code(400).send({
			error: "VALIDATION_ERROR",
			message: "Request validation failed",
			details: error.validation,
			timestamp: new Date().toISOString(),
		});
		return;
	}

	if (error.name?.includes("Sequelize")) {
		reply.code(503).send({
			error: "DATABASE_ERROR",
			message: "Database service unavailable",
			timestamp: new Date().toISOString(),
		});
		return;
	}

	const statusCode = error.statusCode || 500;
	reply.code(statusCode).send({
		error: "INTERNAL_SERVER_ERROR",
		message:
			process.env.NODE_ENV === "development"
				? error.message
				: "Something went wrong",
		...(process.env.NODE_ENV === "development" && { stack: error.stack }),
		timestamp: new Date().toISOString(),
	});
}
