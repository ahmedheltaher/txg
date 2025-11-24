import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { UserModel } from "./models/user.model";

export async function seed() {
	const users = await UserModel.findAll();

	if (users.length > 0) {
		console.log("Database already seeded");
		return;
	}

	console.log("Seeding database...");

	const passwordHash = await bcrypt.hash("password123", 10);

	await Promise.all([
		UserModel.create({
			id: uuidv4(),
			email: "test@example.com",
			passwordHash,
			createdAt: new Date(),
		}),
		UserModel.create({
			id: uuidv4(),
			email: "admin@example.com",
			passwordHash,
			createdAt: new Date(),
		}),
	]);

	console.log("Seed completed successfully");
}
