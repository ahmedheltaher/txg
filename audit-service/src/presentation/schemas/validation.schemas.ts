import { FastifySchema } from "fastify";

export const queryAuditLogsSchema: FastifySchema = {
	querystring: {
		type: "object",
		properties: {
			userId: { type: "string", format: "uuid" },
			aggregateId: { type: "string", format: "uuid" },
			aggregateType: { type: "string" },
			action: { type: "string", enum: ["CREATE", "UPDATE", "DELETE"] },
			status: { type: "string", enum: ["SUCCESS", "FAILED", "ROLLED_BACK"] },
			startDate: { type: "string", format: "date-time" },
			endDate: { type: "string", format: "date-time" },
			page: { type: "number", minimum: 1, default: 1 },
			limit: { type: "number", minimum: 1, maximum: 100, default: 10 },
		},
	},
};
