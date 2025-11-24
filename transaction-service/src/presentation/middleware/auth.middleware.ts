import { FastifyReply, FastifyRequest } from "fastify";
import { JwtService } from "../../infrastructure/auth/jwt.service";

const jwtService = new JwtService();

export async function authMiddleware(
	request: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	try {
		const authHeader = request.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return reply
				.code(401)
				.send({ error: "Missing or invalid authorization header" });
		}

		const token = authHeader.substring(7);
		const payload = jwtService.verifyToken(token);

		request.userId = payload.userId;
	} catch (error) {
		return reply.code(401).send({ error: "Invalid or expired token" });
	}
}

declare module "fastify" {
	interface FastifyRequest {
		userId?: string;
	}
}
