import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export function errorHandler(
	error: FastifyError,
	request: FastifyRequest,
	reply: FastifyReply
): void {
	if (error.validation) {
		reply.code(400).send({
			error: "Validation error",
			details: error.validation,
		});
		return;
	}

	if (error.message === "Transaction not found") {
		reply.code(404).send({ error: error.message });
		return;
	}

	if (
		error.message === "Unauthorized" ||
		error.message === "Invalid credentials"
	) {
		reply.code(401).send({ error: error.message });
		return;
	}

	if (error.message === "Cannot delete completed transaction") {
		reply.code(400).send({ error: error.message });
		return;
	}

	if (error.message === "You are not authorized to access this transaction") {
		reply.code(403).send({ error: error.message });
		return;
	}

	reply.code(500).send({
		error: "Internal server error",
		message: process.env.NODE_ENV === "development" ? error.message : undefined,
	});
}
