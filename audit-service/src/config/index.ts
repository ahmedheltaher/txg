import dotenv from "dotenv";

dotenv.config();

export const config = {
	port: parseInt(process.env.PORT || "3001", 10),
	database: {
		url:
			process.env.DATABASE_URL ||
			"postgresql://user:password@localhost:5433/audit",
		logging: process.env.DB_LOGGING === "true",
	},
	rabbitmq: {
		url: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
	},
};
