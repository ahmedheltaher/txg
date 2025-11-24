import { transactionService } from "@/services/transactionService";
import type { User } from "@/types";
import { decodeToken } from "@/utils/jwt";
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

interface AuthContextValue {
	token: string | null;
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	login: (email: string, password: string) => Promise<LoginResult>;
	logout: () => void;
}

interface LoginResult {
	success: boolean;
	error?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [token, setToken] = useState<string | null>(
		localStorage.getItem("token")
	);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);

	const isAuthenticated = !!token;

	useEffect(() => {
		if (token) {
			const decodedUser = decodeToken(token);
			if (decodedUser) {
				setUser(decodedUser);
			} else {
				logout();
			}
		}
	}, [token]);

	const login = useCallback(
		async (email: string, password: string): Promise<LoginResult> => {
			setLoading(true);
			try {
				const data = await transactionService.login(email, password);

				localStorage.setItem("token", data.token);
				setToken(data.token);
				setUser({ userId: data.userId, email: data.email });

				return { success: true };
			} catch (error) {
				const message = error instanceof Error ? error.message : "Login failed";
				return { success: false, error: message };
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	const logout = useCallback(() => {
		localStorage.removeItem("token");
		setToken(null);
		setUser(null);
	}, []);

	const value: AuthContextValue = {
		token,
		user,
		login,
		logout,
		loading,
		isAuthenticated,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
