import Fastify from "fastify";
import { JwtService } from "../../src/infrastructure/auth/jwt.service";
import { OutboxModel } from "../../src/infrastructure/database/models/outbox.model";
import { TransactionModel } from "../../src/infrastructure/database/models/transaction.model";
import { UserModel } from "../../src/infrastructure/database/models/user.model";
import { sequelize } from "../../src/infrastructure/database/sequelize";
import { errorHandler } from "../../src/presentation/middleware/error.middleware";
import { authRoutes } from "../../src/presentation/routes/auth.routes";
import { transactionRoutes } from "../../src/presentation/routes/transaction.routes";

describe("Transactions E2E", () => {
	let app: any;
	let jwtService: JwtService;
	let authToken: string;
	let userId: string;

	beforeAll(async () => {
		await sequelize.authenticate();
		await sequelize.sync({ alter: true, force: true });
		const user = await UserModel.create({
			id: "12345678-1234-1234-1234-123456789012",
			email: "test@example.com",
			passwordHash:
				"$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
			createdAt: new Date(),
		});

		userId = user.id;
		jwtService = new JwtService();
		authToken = jwtService.generateToken(userId);
	});

	beforeEach(async () => {
		app = Fastify();
		app.setErrorHandler(errorHandler);

		await app.register(authRoutes);
		await app.register(transactionRoutes);

		await TransactionModel.destroy({ where: {}, force: true });
		await OutboxModel.destroy({ where: {}, force: true });
	});

	afterAll(async () => {
		await sequelize.close();
	});

	describe("POST /transactions", () => {
		it("should create transaction successfully", async () => {
			const response = await app.inject({
				method: "POST",
				url: "/transactions",
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
				payload: {
					amount: 100.5,
					currency: "USD",
					description: "E2E test transaction",
				},
			});

			expect(response.statusCode).toBe(201);
			const body = JSON.parse(response.body);
			expect(body.amount).toBe(100.5);
			expect(body.currency).toBe("USD");
			expect(body.status).toBe("PENDING");
			expect(body.userId).toBe(userId);
		});

		it("should return 401 without authentication", async () => {
			const response = await app.inject({
				method: "POST",
				url: "/transactions",
				payload: {
					amount: 100,
					currency: "USD",
				},
			});

			expect(response.statusCode).toBe(401);
		});

		it("should return 400 for invalid data", async () => {
			const response = await app.inject({
				method: "POST",
				url: "/transactions",
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
				payload: {
					amount: -100,
					currency: "USD",
				},
			});

			expect(response.statusCode).toBe(400);
		});
	});

	describe("GET /transactions", () => {
		beforeEach(async () => {
			await TransactionModel.bulkCreate([
				{
					id: "a1345678-1234-1234-1234-123456789012",
					userId: userId,
					amount: 100,
					currency: "USD",
					status: "PENDING",
					description: "Test 1",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					id: "a2345678-1234-1234-1234-123456789012",
					userId: userId,
					amount: 200,
					currency: "EUR",
					status: "COMPLETED",
					description: "Test 2",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);
		});

		it("should list transactions with pagination", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/transactions?page=1&limit=10",
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.data).toHaveLength(2);
			expect(body.total).toBe(2);
			expect(body.page).toBe(1);
			expect(body.limit).toBe(10);
		});

		it("should return empty list for user with no transactions", async () => {
			const otherUser = await UserModel.create({
				id: "12345678-1234-1234-1234-123456789013",
				email: "other@example.com",
				passwordHash: "hash",
				createdAt: new Date(),
			});

			const otherUserToken = jwtService.generateToken(otherUser.id);

			const response = await app.inject({
				method: "GET",
				url: "/transactions",
				headers: {
					Authorization: `Bearer ${otherUserToken}`,
				},
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.data).toHaveLength(0);
			expect(body.total).toBe(0);
		});
	});

	describe("GET /transactions/:id", () => {
		it("should get transaction by id", async () => {
			const transaction = await TransactionModel.create({
				id: "b1345678-1234-1234-1234-123456789012",
				userId: userId,
				amount: 150,
				currency: "GBP",
				status: "PENDING",
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const response = await app.inject({
				method: "GET",
				url: `/transactions/${transaction.id}`,
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.id).toBe(transaction.id);
			expect(body.amount).toBe(150);
		});

		it("should return 404 for non-existent transaction", async () => {
			const response = await app.inject({
				method: "GET",
				url: "/transactions/12b45678-1234-1234-1234-123456789012",
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});

			expect(response.statusCode).toBe(404);
		});

		it("should return 403 for unauthorized access", async () => {
			const transaction = await TransactionModel.create({
				id: "b4345678-1234-1234-1234-123456789012",
				userId: "12345678-1234-1234-1234-123456789014",
				amount: 150,
				currency: "GBP",
				status: "PENDING",
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			const response = await app.inject({
				method: "GET",
				url: `/transactions/${transaction.id}`,
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			});

			expect(response.statusCode).toBe(403);
		});
	});
});
