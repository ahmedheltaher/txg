import { useAuth } from "@/contexts/AuthContext";
import type { NotificationSeverity } from "@/types";
import {
	Alert,
	Box,
	Button,
	Container,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import { FormEvent, useState } from "react";

interface LoginProps {
	onNotification: (message: string, severity: NotificationSeverity) => void;
}

export default function Login({ onNotification }: LoginProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const { login, loading } = useAuth();

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");

		const result = await login(email, password);

		if (result.success) {
			onNotification("Login successful!", "success");
		} else {
			setError(result.error || "Login failed");
			onNotification("Login failed. Please check your credentials.", "error");
		}
	};

	return (
		<Container component="main" maxWidth="xs">
			<Box
				sx={{
					marginTop: 8,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
					<Typography component="h1" variant="h5" align="center" gutterBottom>
						Sign In
					</Typography>

					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					<Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{ mt: 3, mb: 2 }}
							disabled={loading}
						>
							{loading ? "Signing In..." : "Sign In"}
						</Button>

						<Typography variant="body2" color="text.secondary" align="center">
							Demo credentials: test@example.com / password123
						</Typography>
					</Box>
				</Paper>
			</Box>
		</Container>
	);
}
