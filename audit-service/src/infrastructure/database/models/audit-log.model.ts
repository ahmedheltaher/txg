import { DataTypes, Model } from "sequelize";
import { sequelize } from "../sequelize";

export class AuditLogModel extends Model {
	declare id: string;
	declare eventId: string;
	declare aggregateId: string;
	declare aggregateType: string;
	declare action: string;
	declare userId: string;
	declare status: string;
	declare metadata: object;
	declare createdAt: Date;
	declare ipAddress?: string;
	declare userAgent?: string;
}

AuditLogModel.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
		},
		eventId: {
			type: DataTypes.UUID,
			allowNull: false,
			unique: true,
			field: "event_id",
		},
		aggregateId: {
			type: DataTypes.UUID,
			allowNull: false,
			field: "aggregate_id",
		},
		aggregateType: {
			type: DataTypes.STRING(50),
			allowNull: false,
			field: "aggregate_type",
		},
		action: {
			type: DataTypes.STRING(20),
			allowNull: false,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			field: "user_id",
		},
		status: {
			type: DataTypes.STRING(20),
			allowNull: false,
		},
		metadata: {
			type: DataTypes.JSONB,
			allowNull: false,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			field: "created_at",
		},
		ipAddress: {
			type: DataTypes.STRING(45),
			allowNull: true,
			field: "ip_address",
		},
		userAgent: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: "user_agent",
		},
	},
	{
		sequelize,
		tableName: "audit_logs",
		timestamps: false,
		indexes: [
			{ fields: ["event_id"] },
			{ fields: ["aggregate_id"] },
			{ fields: ["user_id"] },
			{ fields: ["created_at"] },
			{ fields: ["aggregate_type", "action"] },
		],
	}
);
