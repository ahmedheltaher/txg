import dotenv from "dotenv";

dotenv.config();

export const config = {
	port: parseInt(process.env.PORT || "3000", 10),
	database: {
		url:
			process.env.DATABASE_URL ||
			"postgresql://user:password@localhost:5432/transactions",
		logging: process.env.DB_LOGGING === "true",
	},
	jwt: {
		secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
		expiresIn: process.env.JWT_EXPIRES_IN || "24h",
	},
	rabbitmq: {
		url: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
	},
	outbox: {
		batchSize: parseInt(process.env.OUTBOX_BATCH_SIZE || "10", 10),
		pollIntervalMs: parseInt(process.env.OUTBOX_POLL_INTERVAL_MS || "1000", 10),
	},
};
