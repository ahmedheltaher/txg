import { Sequelize } from "sequelize";
import { config } from "../../config";

export const sequelize = new Sequelize(config.database.url, {
	dialect: "postgres",
	logging: config.database.logging ? console.log : false,
	pool: {
		max: 10,
		min: 0,
		acquire: 30_000,
		idle: 10_000,
	},
});

export async function initializeDatabase(): Promise<void> {
	try {
		await sequelize.authenticate();
		console.log("Database connection established successfully");
		await sequelize.sync({ alter: false });
	} catch (error) {
		console.error("Unable to connect to database:", error);
		throw error;
	}
}
