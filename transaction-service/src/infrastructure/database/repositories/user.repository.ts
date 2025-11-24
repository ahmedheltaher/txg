import { User } from "../../../domain/entities/user";
import { IUserRepository } from "../../../domain/repositories/user-repository.port";
import { UserModel } from "../models/user.model";

export class UserRepository implements IUserRepository {
	async create(user: User): Promise<User> {
		const model = await UserModel.create({
			id: user.id,
			email: user.email,
			passwordHash: user.passwordHash,
			createdAt: user.createdAt,
		});

		return this.toDomain(model);
	}

	async findByEmail(email: string): Promise<User | null> {
		const model = await UserModel.findOne({ where: { email } });
		return model ? this.toDomain(model) : null;
	}

	async findById(id: string): Promise<User | null> {
		const model = await UserModel.findByPk(id);
		return model ? this.toDomain(model) : null;
	}

	private toDomain(model: UserModel): User {
		return new User(model.id, model.email, model.passwordHash, model.createdAt);
	}
}
