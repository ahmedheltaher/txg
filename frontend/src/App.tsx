import AuditLogs from "@/components/AuditLogs";
import Login from "@/components/Login";
import Navbar from "@/components/Navbar";
import Transactions from "@/components/Transactions";
import { theme } from "@/config/theme";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/useNotification";
import {
	Alert,
	Box,
	CssBaseline,
	Snackbar,
	ThemeProvider,
} from "@mui/material";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";

function AppContent() {
	const { isAuthenticated } = useAuth();
	const { notification, showNotification, hideNotification } =
		useNotification();

	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			<Navbar />
			<Box component="main" sx={{ flex: 1, p: 3 }}>
				<Routes>
					<Route
						path="/login"
						element={
							!isAuthenticated ? (
								<Login onNotification={showNotification} />
							) : (
								<Navigate to="/transactions" replace />
							)
						}
					/>
					<Route
						path="/transactions"
						element={
							isAuthenticated ? (
								<Transactions onNotification={showNotification} />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route
						path="/audit-logs"
						element={
							isAuthenticated ? (
								<AuditLogs onNotification={showNotification} />
							) : (
								<Navigate to="/login" replace />
							)
						}
					/>
					<Route path="/" element={<Navigate to="/transactions" replace />} />
				</Routes>
			</Box>

			<Snackbar
				open={notification.open}
				autoHideDuration={6000}
				onClose={hideNotification}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert
					onClose={hideNotification}
					severity={notification.severity}
					sx={{ width: "100%" }}
				>
					{notification.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}

export default function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Router>
				<AuthProvider>
					<AppContent />
				</AuthProvider>
			</Router>
		</ThemeProvider>
	);
}
