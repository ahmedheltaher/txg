import * as bcrypt from "bcrypt";
import Fastify from "fastify";
import { UserModel } from "../../src/infrastructure/database/models/user.model";
import { sequelize } from "../../src/infrastructure/database/sequelize";
import { errorHandler } from "../../src/presentation/middleware/error.middleware";
import { authRoutes } from "../../src/presentation/routes/auth.routes";

describe("Auth E2E", () => {
	let app: any;

	beforeAll(async () => {
		await sequelize.authenticate();
		await sequelize.sync({ force: true });
	});

	beforeEach(async () => {
		app = Fastify();
		app.setErrorHandler(errorHandler);
		await app.register(authRoutes);
		await UserModel.destroy({ where: {}, force: true });
	});

	afterAll(async () => {
		await sequelize.close();
	});

	describe("POST /auth/login", () => {
		beforeEach(async () => {
			const hashedPassword = await bcrypt.hash("password123", 10);
			await UserModel.create({
				id: "12345678-1234-1234-1234-123456789012",
				email: "test@example.com",
				passwordHash: hashedPassword,
				createdAt: new Date(),
			});
		});

		it("should login successfully with valid credentials", async () => {
			const response = await app.inject({
				method: "POST",
				url: "/auth/login",
				payload: {
					email: "test@example.com",
					password: "password123",
				},
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.token).toBeDefined();
			expect(body.userId).toBe("12345678-1234-1234-1234-123456789012");
			expect(body.email).toBe("test@example.com");
		});

		it("should return 401 for invalid credentials", async () => {
			const response = await app.inject({
				method: "POST",
				url: "/auth/login",
				payload: {
					email: "test@example.com",
					password: "wrong-password",
				},
			});

			expect(response.statusCode).toBe(401);
		});

		it("should return 401 for non-existent user", async () => {
			const response = await app.inject({
				method: "POST",
				url: "/auth/login",
				payload: {
					email: "nonexistent@example.com",
					password: "password123",
				},
			});

			expect(response.statusCode).toBe(401);
		});

		it("should return 400 for invalid input", async () => {
			const response = await app.inject({
				method: "POST",
				url: "/auth/login",
				payload: {
					email: "invalid-email",
					password: "123",
				},
			});

			expect(response.statusCode).toBe(400);
		});
	});
});
