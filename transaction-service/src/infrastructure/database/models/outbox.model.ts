import { DataTypes, Model } from "sequelize";
import { sequelize } from "../sequelize";

export class OutboxModel extends Model {
	declare id: string;
	declare aggregateId: string;
	declare eventType: string;
	declare payload: object;
	declare status: string;
	declare createdAt: Date;
	declare processedAt?: Date;
	declare retryCount: number;
}

OutboxModel.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
		},
		aggregateId: {
			type: DataTypes.UUID,
			allowNull: false,
			field: "aggregate_id",
		},
		eventType: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: "event_type",
		},
		payload: {
			type: DataTypes.JSONB,
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING(20),
			allowNull: false,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			field: "created_at",
		},
		processedAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: "processed_at",
		},
		retryCount: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			field: "retry_count",
		},
	},
	{
		sequelize,
		tableName: "outbox_events",
		timestamps: false,
		indexes: [
			{
				fields: ["status", "created_at"],
			},
		],
	}
);
