import { FastifyInstance } from "fastify";
import { LoginUserUseCase } from "../../application/use-cases/login-user";
import { JwtService } from "../../infrastructure/auth/jwt.service";
import { UserRepository } from "../../infrastructure/database/repositories/user.repository";
import { loginSchema } from "../schemas/validation.schemas";

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
	const userRepo = new UserRepository();
	const jwtService = new JwtService();
	const loginUseCase = new LoginUserUseCase(userRepo, jwtService);

	fastify.post(
		"/auth/login",
		{
			schema: loginSchema,
		},
		async (request, reply) => {
			const { email, password } = request.body as {
				email: string;
				password: string;
			};

			const result = await loginUseCase.execute({ email, password });

			reply.code(200).send(result);
		}
	);
}
