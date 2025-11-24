import type { ApiError } from "@/types";

class ApiClient {
	private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
		const token = localStorage.getItem("token");

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...(options.headers as Record<string, string>),
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		try {
			const response = await fetch(url, {
				...options,
				headers,
			});

			if (!response.ok) {
				const error: ApiError = {
					message: `Request failed with status ${response.status}`,
					status: response.status,
				};
				throw error;
			}

			return await response.json();
		} catch (error) {
			if (error instanceof Error) {
				throw { message: error.message } as ApiError;
			}
			throw error;
		}
	}

	async get<T>(url: string): Promise<T> {
		return this.request<T>(url, { method: "GET" });
	}

	async post<T>(url: string, data: unknown): Promise<T> {
		return this.request<T>(url, {
			method: "POST",
			body: JSON.stringify(data),
		});
	}

	async put<T>(url: string, data: unknown): Promise<T> {
		return this.request<T>(url, {
			method: "PUT",
			body: JSON.stringify(data),
		});
	}

	async delete<T>(url: string): Promise<T> {
		return this.request<T>(url, { method: "DELETE" });
	}
}

export const apiClient = new ApiClient();
