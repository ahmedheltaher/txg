import { useAuth } from "@/contexts/AuthContext";
import { AppBar, Box, Button, Chip, Toolbar, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
	const { user, logout, isAuthenticated } = useAuth();
	const location = useLocation();

	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					TXG Financial Platform
				</Typography>

				{isAuthenticated && (
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<Button
							color="inherit"
							component={Link}
							to="/transactions"
							variant={
								location.pathname === "/transactions" ? "outlined" : "text"
							}
						>
							Transactions
						</Button>
						<Button
							color="inherit"
							component={Link}
							to="/audit-logs"
							variant={
								location.pathname === "/audit-logs" ? "outlined" : "text"
							}
						>
							Audit Logs
						</Button>

						<Chip
							label={user?.email}
							variant="outlined"
							size="small"
							sx={{ color: "white", borderColor: "white" }}
						/>
						<Button color="inherit" onClick={logout}>
							Logout
						</Button>
					</Box>
				)}
			</Toolbar>
		</AppBar>
	);
}
