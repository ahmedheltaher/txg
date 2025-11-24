import { DataTypes, Model } from "sequelize";
import { sequelize } from "../sequelize";

export class UserModel extends Model {
	declare id: string;
	declare email: string;
	declare passwordHash: string;
	declare createdAt: Date;
}

UserModel.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
		},
		passwordHash: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: "password_hash",
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			field: "created_at",
		},
	},
	{
		sequelize,
		tableName: "users",
		timestamps: false,
	}
);
