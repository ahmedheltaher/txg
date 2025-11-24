import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { config } from "./config";
import { OutboxRepository } from "./infrastructure/database/repositories/outbox.repository";
import { seed } from "./infrastructure/database/seed";
import { initializeDatabase } from "./infrastructure/database/sequelize";
import { OutboxProcessor } from "./infrastructure/messaging/outbox-processor";
import { RabbitMQClient } from "./infrastructure/messaging/rabbit-mq-client";
import { errorHandler } from "./presentation/middleware/error.middleware";
import { authRoutes } from "./presentation/routes/auth.routes";
import { transactionRoutes } from "./presentation/routes/transaction.routes";

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
	reply.send({ status: "ok", service: "transaction-service" });
});

fastify.setErrorHandler(errorHandler);

let outboxProcessor: OutboxProcessor | null = null;
let rabbitmqClient: RabbitMQClient | null = null;

async function start(): Promise<void> {
	try {
		await fastify.register(cors, {
			origin: true,
		});

		await fastify.register(swagger, {
			openapi: {
				info: {
					title: "Transaction Service API",
					description: "API documentation for Transaction Management Service",
					version: "1.0.0",
				},
				servers: [
					{
						url: `http://localhost:${config.port}`,
						description: "Development server",
					},
				],
				components: {
					securitySchemes: {
						bearerAuth: {
							type: "http",
							scheme: "bearer",
							bearerFormat: "JWT",
						},
					},
				},
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
		await seed();

		rabbitmqClient = new RabbitMQClient();
		await rabbitmqClient.connect();

		const outboxRepo = new OutboxRepository();
		outboxProcessor = new OutboxProcessor(
			outboxRepo,
			rabbitmqClient,
			config.outbox.batchSize,
			config.outbox.pollIntervalMs
		);
		outboxProcessor.start();

		await fastify.register(authRoutes);
		await fastify.register(transactionRoutes);

		await fastify.listen({ port: config.port, host: "0.0.0.0" });

		console.log(
			`Transaction Service running on http://localhost:${config.port}`
		);
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

	outboxProcessor?.stop();
	await rabbitmqClient?.close();
	await fastify.close();

	process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

start();
