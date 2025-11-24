import type { User } from "@/types";

export function decodeToken(token: string): User | null {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return {
			userId: payload.userId,
			email: payload.email,
		};
	} catch (error) {
		console.error("Invalid token:", error);
		return null;
	}
}
