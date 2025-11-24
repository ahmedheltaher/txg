import { FastifyInstance } from "fastify";
import { QueryAuditLogsUseCase } from "../../application/use-cases/query-audit-logs";
import { AuditLogRepository } from "../../infrastructure/database/repositories/audit-log.repository";
import { queryAuditLogsSchema } from "../schemas/validation.schemas";

export async function auditRoutes(fastify: FastifyInstance): Promise<void> {
	const auditLogRepo = new AuditLogRepository();
	const queryUseCase = new QueryAuditLogsUseCase(auditLogRepo);

	fastify.get(
		"/audit-logs",
		{
			schema: queryAuditLogsSchema,
		},
		async (request, reply) => {
			const query = request.query as any;
			const result = await queryUseCase.execute(query);
			reply.send(result);
		}
	);
}
