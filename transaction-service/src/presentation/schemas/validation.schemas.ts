import { FastifySchema } from "fastify";

export const loginSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["email", "password"],
		properties: {
			email: { type: "string", format: "email" },
			password: { type: "string", minLength: 6 },
		},
	},
	response: {
		200: {
			type: "object",
			properties: {
				userId: { type: "string" },
				email: { type: "string" },
				token: { type: "string" },
			},
		},
	},
};

export const createTransactionSchema: FastifySchema = {
	security: [{ bearerAuth: [] }],
	body: {
		type: "object",
		required: ["amount", "currency"],
		properties: {
			amount: { type: "number", minimum: 0.01 },
			currency: { type: "string", enum: ["USD", "EUR", "GBP"] },
			description: { type: "string", maxLength: 500 },
		},
	},
	response: {
		201: {
			type: "object",
			properties: {
				id: { type: "string" },
				userId: { type: "string" },
				amount: { type: "number" },
				currency: { type: "string" },
				status: { type: "string" },
				description: { type: "string" },
				createdAt: { type: "string" },
				updatedAt: { type: "string" },
			},
		},
	},
};

export const updateTransactionSchema: FastifySchema = {
	security: [{ bearerAuth: [] }],
	params: {
		type: "object",
		required: ["id"],
		properties: {
			id: { type: "string", format: "uuid" },
		},
	},
	body: {
		type: "object",
		properties: {
			status: {
				type: "string",
				enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
			},
		},
	},
};

export const getTransactionSchema: FastifySchema = {
	security: [{ bearerAuth: [] }],
	params: {
		type: "object",
		required: ["id"],
		properties: {
			id: { type: "string", format: "uuid" },
		},
	},
};

export const listTransactionsSchema: FastifySchema = {
	security: [{ bearerAuth: [] }],
	querystring: {
		type: "object",
		properties: {
			page: { type: "number", minimum: 1, default: 1 },
			limit: { type: "number", minimum: 1, maximum: 100, default: 10 },
		},
	},
};
