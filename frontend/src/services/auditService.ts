import { API_CONFIG } from "@/config/constants";
import type { AuditLog, AuditLogFilters, PaginatedResponse } from "@/types";
import { apiClient } from "./api";

export const auditService = {
	async getAuditLogs(
		page: number,
		limit: number,
		filters: Partial<AuditLogFilters>
	): Promise<PaginatedResponse<AuditLog>> {
		const queryParams = new URLSearchParams();
		queryParams.append("page", page.toString());
		queryParams.append("limit", limit.toString());

		Object.entries(filters).forEach(([key, value]) => {
			if (value) {
				if (key === "startDate" || key === "endDate") {
					queryParams.append(key, new Date(value).toISOString());
				} else {
					queryParams.append(key, value);
				}
			}
		});

		return apiClient.get<PaginatedResponse<AuditLog>>(
			`${API_CONFIG.auditBaseUrl}/audit-logs?${queryParams}`
		);
	},
};
