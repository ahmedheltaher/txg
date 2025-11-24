import { FastifyInstance } from "fastify";
import { CreateTransactionUseCase } from "../../application/use-cases/create-transaction";
import { DeleteTransactionUseCase } from "../../application/use-cases/delete-transaction";
import { GetTransactionUseCase } from "../../application/use-cases/get-transaction";
import { ListTransactionsUseCase } from "../../application/use-cases/list-transactions";
import { UpdateTransactionUseCase } from "../../application/use-cases/update-transaction";
import { OutboxRepository } from "../../infrastructure/database/repositories/outbox.repository";
import { TransactionRepository } from "../../infrastructure/database/repositories/transaction.repository";
import { sequelize } from "../../infrastructure/database/sequelize";
import { authMiddleware } from "../middleware/auth.middleware";
import {
	createTransactionSchema,
	getTransactionSchema,
	listTransactionsSchema,
	updateTransactionSchema,
} from "../schemas/validation.schemas";

export async function transactionRoutes(
	fastify: FastifyInstance
): Promise<void> {
	const transactionRepo = new TransactionRepository();
	const outboxRepo = new OutboxRepository();

	const createUseCase = new CreateTransactionUseCase(
		transactionRepo,
		outboxRepo,
		sequelize
	);
	const updateUseCase = new UpdateTransactionUseCase(
		transactionRepo,
		outboxRepo,
		sequelize
	);
	const deleteUseCase = new DeleteTransactionUseCase(
		transactionRepo,
		outboxRepo,
		sequelize
	);
	const getUseCase = new GetTransactionUseCase(transactionRepo);
	const listUseCase = new ListTransactionsUseCase(transactionRepo);

	fastify.post(
		"/transactions",
		{
			preHandler: authMiddleware,
			schema: createTransactionSchema,
		},
		async (request, reply) => {
			const userId = request.userId!;
			const dto = request.body as any;

			const result = await createUseCase.execute(userId, dto);

			reply.code(201).send(result);
		}
	);

	fastify.get(
		"/transactions",
		{
			preHandler: authMiddleware,
			schema: listTransactionsSchema,
		},
		async (request, reply) => {
			const userId = request.userId!;
			const { page = 1, limit = 10 } = request.query as any;

			const result = await listUseCase.execute(userId, page, limit);

			reply.send(result);
		}
	);

	fastify.get(
		"/transactions/:id",
		{
			preHandler: authMiddleware,
			schema: getTransactionSchema,
		},
		async (request, reply) => {
			const userId = request.userId!;
			const { id } = request.params as { id: string };

			const result = await getUseCase.execute(id, userId);

			reply.send(result);
		}
	);

	fastify.put(
		"/transactions/:id",
		{
			preHandler: authMiddleware,
			schema: updateTransactionSchema,
		},
		async (request, reply) => {
			const userId = request.userId!;
			const { id } = request.params as { id: string };
			const dto = request.body as any;

			const result = await updateUseCase.execute(id, userId, dto);

			reply.send(result);
		}
	);

	fastify.delete(
		"/transactions/:id",
		{
			preHandler: authMiddleware,
			schema: getTransactionSchema,
		},
		async (request, reply) => {
			const userId = request.userId!;
			const { id } = request.params as { id: string };

			await deleteUseCase.execute(id, userId);

			reply.code(204).send();
		}
	);
}
