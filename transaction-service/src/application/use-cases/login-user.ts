import * as bcrypt from "bcrypt";
import { AuthenticationError } from "../../domain/errors/custom-errors";
import { IUserRepository } from "../../domain/repositories/user-repository.port";

export interface LoginDTO {
	email: string;
	password: string;
}

export interface LoginResponseDTO {
	userId: string;
	email: string;
	token: string;
}

export class LoginUserUseCase {
	constructor(
		private userRepo: IUserRepository,
		private jwtService: { generateToken(userId: string): string }
	) {}

	async execute(dto: LoginDTO): Promise<LoginResponseDTO> {
		const user = await this.userRepo.findByEmail(dto.email);

		if (!user) {
			throw new AuthenticationError("Invalid credentials");
		}

		const isValidPassword = await bcrypt.compare(
			dto.password,
			user.passwordHash
		);

		if (!isValidPassword) {
			throw new AuthenticationError("Invalid credentials");
		}

		const token = this.jwtService.generateToken(user.id);

		return {
			userId: user.id,
			email: user.email,
			token,
		};
	}
}
