import { DataTypes, Model } from "sequelize";
import { sequelize } from "../sequelize";

export class TransactionModel extends Model {
	declare id: string;
	declare userId: string;
	declare amount: number;
	declare currency: string;
	declare status: string;
	declare description?: string;
	declare createdAt: Date;
	declare updatedAt: Date;
}

TransactionModel.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			field: "user_id",
		},
		amount: {
			type: DataTypes.DECIMAL(10, 2),
			allowNull: false,
		},
		currency: {
			type: DataTypes.STRING(3),
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING(20),
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			field: "created_at",
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			field: "updated_at",
		},
	},
	{
		sequelize,
		tableName: "transactions",
		timestamps: true,
	}
);
