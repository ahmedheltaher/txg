import Fastify from "fastify";
import { AuditLogModel } from "../../src/infrastructure/database/models/audit-log.model";
import { initializeDatabase } from "../../src/infrastructure/database/sequelize";
import { errorHandler } from "../../src/presentation/middleware/error.middleware";
import { auditRoutes } from "../../src/presentation/routes/audit.routes";

describe("Audit Service E2E Tests", () => {
	let fastify: any;

	beforeAll(async () => {
		await initializeDatabase();
	});

	beforeEach(async () => {
		fastify = Fastify({
			logger: false,
		});

		fastify.setErrorHandler(errorHandler);
		await fastify.register(auditRoutes);

		await fastify.ready();
		await AuditLogModel.destroy({ where: {} });
	});

	afterEach(async () => {
		await fastify.close();
	});

	afterAll(async () => {
		await AuditLogModel.sequelize?.close();
	});

	describe("GET /audit-logs", () => {
		beforeEach(async () => {
			const testLogs = [
				{
					id: "123e4567-e89b-12d3-a456-426614174001",
					eventId: "123e4467-e89b-12d3-a456-426614174001",
					aggregateId: "123e4567-e89b-12d3-a456-426614174002",
					aggregateType: "TRANSACTION",
					action: "CREATE",
					userId: "123e4567-e89b-12d3-a456-426614174003",
					status: "SUCCESS",
					metadata: { amount: 100 },
					createdAt: new Date("2023-01-01T00:00:00Z"),
				},
				{
					id: "223e4567-e89b-12d3-a456-426614174001",
					eventId: "123e4567-e89b-15d3-a456-426614174002",
					aggregateId: "123e4567-e89b-12d3-a456-426614174002",
					aggregateType: "TRANSACTION",
					action: "UPDATE",
					userId: "123e4567-e89b-12d3-a456-426614174004",
					status: "SUCCESS",
					metadata: { amount: 200 },
					createdAt: new Date("2023-01-02T00:00:00Z"),
				},
				{
					id: "323e4567-e89b-12d3-a456-426614174001",
					eventId: "123e4567-e89b-12d3-a457-426614174003",
					aggregateId: "123e4567-e89b-12d3-b456-426614174002",
					aggregateType: "USER",
					action: "CREATE",
					userId: "123e4567-e89b-12d3-a456-426614174003",
					status: "SUCCESS",
					metadata: { action: "login" },
					createdAt: new Date("2023-01-03T00:00:00Z"),
				},
			];

			for (const log of testLogs) {
				await AuditLogModel.create(log);
			}
		});

		it("should return paginated audit logs", async () => {
			const response = await fastify.inject({
				method: "GET",
				url: "/audit-logs?page=1&limit=2",
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.data).toHaveLength(2);
			expect(body.total).toBe(3);
			expect(body.page).toBe(1);
			expect(body.limit).toBe(2);
		});

		it("should filter audit logs by user ID", async () => {
			const response = await fastify.inject({
				method: "GET",
				url: "/audit-logs?userId=123e4567-e89b-12d3-a456-426614174003",
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.data).toHaveLength(2);
			expect(
				body.data.every(
					(log: any) => log.userId === "123e4567-e89b-12d3-a456-426614174003"
				)
			).toBe(true);
		});

		it("should filter audit logs by aggregate type", async () => {
			const response = await fastify.inject({
				method: "GET",
				url: "/audit-logs?aggregateType=TRANSACTION",
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.data).toHaveLength(2);
			expect(
				body.data.every((log: any) => log.aggregateType === "TRANSACTION")
			).toBe(true);
		});

		it("should return 400 for invalid query parameters", async () => {
			const response = await fastify.inject({
				method: "GET",
				url: "/audit-logs?page=0",
			});

			expect(response.statusCode).toBe(400);
			const body = JSON.parse(response.body);
			expect(body.error).toBe("VALIDATION_ERROR");
		});
	});

	describe("GET /health", () => {
		it("should return service health status", async () => {
			const response = await fastify.inject({
				method: "GET",
				url: "/health",
			});

			expect(response.statusCode).toBe(200);
			const body = JSON.parse(response.body);
			expect(body.status).toBe("ok");
			expect(body.service).toBe("audit-service");
		});
	});
});
