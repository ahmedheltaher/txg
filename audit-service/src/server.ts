import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { CreateAuditLogUseCase } from "./application/use-cases/create-audit-log";
import { config } from "./config";
import { AuditLogRepository } from "./infrastructure/database/repositories/audit-log.repository";
import { initializeDatabase } from "./infrastructure/database/sequelize";
import { RabbitMQClient } from "./infrastructure/messaging/rabbit-mq-client";
import { RabbitMQConsumer } from "./infrastructure/messaging/rabbit-mq-consumer";
import { errorHandler } from "./presentation/middleware/error.middleware";
import { auditRoutes } from "./presentation/routes/audit.routes";

const fastify = Fastify({
	logger: {
		level: "info",
		transport: {
			target: "pino-pretty",
			options: {
				translateTime: "HH:MM:ss Z",
				ignore: "pid,hostname",
			},
		},
	},
});

fastify.get("/health", async (request, reply) => {
	reply.send({ status: "ok", service: "audit-service" });
});

fastify.setErrorHandler(errorHandler);

let rabbitmqClient: RabbitMQClient | null = null;

async function start(): Promise<void> {
	try {
		await fastify.register(cors, {
			origin: true,
		});

		await fastify.register(swagger, {
			openapi: {
				info: {
					title: "Audit Service API",
					description: "API documentation for Audit Log Service",
					version: "1.0.0",
				},
				servers: [
					{
						url: `http://localhost:${config.port}`,
						description: "Development server",
					},
				],
			},
		});

		await fastify.register(swaggerUi, {
			routePrefix: "/docs",
			uiConfig: {
				docExpansion: "list",
				deepLinking: false,
			},
		});

		await initializeDatabase();

		rabbitmqClient = new RabbitMQClient();
		await rabbitmqClient.connect();

		const auditLogRepo = new AuditLogRepository();
		const createAuditLogUseCase = new CreateAuditLogUseCase(auditLogRepo);
		const consumer = new RabbitMQConsumer(
			rabbitmqClient,
			createAuditLogUseCase
		);
		await consumer.start();

		await fastify.register(auditRoutes);

		await fastify.listen({ port: config.port, host: "0.0.0.0" });

		console.log(`Audit Service running on http://localhost:${config.port}`);
		console.log(
			`API Documentation available at http://localhost:${config.port}/docs`
		);
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

async function shutdown(): Promise<void> {
	console.log("Shutting down gracefully...");
	await rabbitmqClient?.close();
	await fastify.close();
	process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
