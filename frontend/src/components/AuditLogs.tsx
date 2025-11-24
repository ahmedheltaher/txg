import {
	AGGREGATE_TYPES,
	AUDIT_ACTIONS,
	AUDIT_STATUSES,
} from "@/config/constants";
import { usePagination } from "@/hooks/usePagination";
import { auditService } from "@/services/auditService";
import type {
	AuditAction,
	AuditLog,
	AuditLogFilters,
	AuditStatus,
	NotificationSeverity,
} from "@/types";
import { formatDateTime } from "@/utils/format";
import { ExpandLess, ExpandMore, FilterList } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Collapse,
	Grid,
	IconButton,
	MenuItem,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

interface AuditLogsProps {
	onNotification: (message: string, severity: NotificationSeverity) => void;
}

export default function AuditLogs({ onNotification }: AuditLogsProps) {
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
	const [_loading, setLoading] = useState(false);
	const [totalCount, setTotalCount] = useState(0);
	const [showFilters, setShowFilters] = useState(false);
	const [expandedRow, setExpandedRow] = useState<string | null>(null);
	const [filters, setFilters] = useState<AuditLogFilters>({
		userId: "",
		aggregateId: "",
		aggregateType: "",
		action: "",
		status: "",
		startDate: "",
		endDate: "",
	});

	const {
		page,
		rowsPerPage,
		handleChangePage,
		handleChangeRowsPerPage,
		resetPage,
	} = usePagination();

	const fetchAuditLogs = useCallback(async () => {
		setLoading(true);
		try {
			const data = await auditService.getAuditLogs(
				page + 1,
				rowsPerPage,
				filters
			);
			setAuditLogs(data.data);
			setTotalCount(data.total);
		} catch (error) {
			onNotification("Failed to fetch audit logs", "error");
		} finally {
			setLoading(false);
		}
	}, [page, rowsPerPage, filters, onNotification]);

	useEffect(() => {
		fetchAuditLogs();
	}, [page, rowsPerPage]);

	const handleFilterChange = (field: keyof AuditLogFilters, value: string) => {
		setFilters({ ...filters, [field]: value });
	};

	const applyFilters = () => {
		resetPage();
		fetchAuditLogs();
	};

	const clearFilters = () => {
		setFilters({
			userId: "",
			aggregateId: "",
			aggregateType: "",
			action: "",
			status: "",
			startDate: "",
			endDate: "",
		});
	};

	const getActionColor = (action: AuditAction) => {
		const colors = {
			CREATE: "success",
			UPDATE: "warning",
			DELETE: "error",
		} as const;
		return colors[action] || "default";
	};

	const getStatusColor = (status: AuditStatus) => {
		const colors = {
			SUCCESS: "success",
			FAILED: "error",
			ROLLED_BACK: "warning",
		} as const;
		return colors[status] || "default";
	};

	const toggleRowExpand = (logId: string) => {
		setExpandedRow(expandedRow === logId ? null : logId);
	};

	return (
		<Box>
			<Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
				<Typography variant="h4">Audit Logs</Typography>
				<Button
					startIcon={<FilterList />}
					onClick={() => setShowFilters(!showFilters)}
					variant="outlined"
				>
					Filters
				</Button>
			</Box>

			<Collapse in={showFilters}>
				<Card sx={{ mb: 3 }}>
					<CardContent>
						<Grid container spacing={2}>
							<Grid item xs={12} sm={6} md={3}>
								<TextField
									fullWidth
									label="User ID"
									value={filters.userId}
									onChange={(e) => handleFilterChange("userId", e.target.value)}
									size="small"
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<TextField
									fullWidth
									label="Aggregate ID"
									value={filters.aggregateId}
									onChange={(e) =>
										handleFilterChange("aggregateId", e.target.value)
									}
									size="small"
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={2}>
								<TextField
									fullWidth
									select
									label="Aggregate Type"
									value={filters.aggregateType}
									onChange={(e) =>
										handleFilterChange("aggregateType", e.target.value)
									}
									size="small"
								>
									<MenuItem value="">All</MenuItem>
									{AGGREGATE_TYPES.map((type) => (
										<MenuItem key={type} value={type}>
											{type}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={12} sm={6} md={2}>
								<TextField
									fullWidth
									select
									label="Action"
									value={filters.action}
									onChange={(e) => handleFilterChange("action", e.target.value)}
									size="small"
								>
									<MenuItem value="">All</MenuItem>
									{AUDIT_ACTIONS.map((action) => (
										<MenuItem key={action} value={action}>
											{action}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={12} sm={6} md={2}>
								<TextField
									fullWidth
									select
									label="Status"
									value={filters.status}
									onChange={(e) => handleFilterChange("status", e.target.value)}
									size="small"
								>
									<MenuItem value="">All</MenuItem>
									{AUDIT_STATUSES.map((status) => (
										<MenuItem key={status} value={status}>
											{status}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<TextField
									fullWidth
									label="Start Date"
									type="datetime-local"
									value={filters.startDate}
									onChange={(e) =>
										handleFilterChange("startDate", e.target.value)
									}
									InputLabelProps={{ shrink: true }}
									size="small"
								/>
							</Grid>
							<Grid item xs={12} sm={6} md={3}>
								<TextField
									fullWidth
									label="End Date"
									type="datetime-local"
									value={filters.endDate}
									onChange={(e) =>
										handleFilterChange("endDate", e.target.value)
									}
									InputLabelProps={{ shrink: true }}
									size="small"
								/>
							</Grid>
							<Grid item xs={12}>
								<Box sx={{ display: "flex", gap: 1 }}>
									<Button variant="contained" onClick={applyFilters}>
										Apply Filters
									</Button>
									<Button variant="outlined" onClick={clearFilters}>
										Clear Filters
									</Button>
								</Box>
							</Grid>
						</Grid>
					</CardContent>
				</Card>
			</Collapse>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell />
							<TableCell>Event ID</TableCell>
							<TableCell>Aggregate ID</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Action</TableCell>
							<TableCell>User ID</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Date</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{auditLogs.map((log) => (
							<>
								<TableRow key={log.id}>
									<TableCell>
										<IconButton
											size="small"
											onClick={() => toggleRowExpand(log.id)}
										>
											{expandedRow === log.id ? <ExpandLess /> : <ExpandMore />}
										</IconButton>
									</TableCell>
									<TableCell>{log.eventId}</TableCell>
									<TableCell>{log.aggregateId}</TableCell>
									<TableCell>{log.aggregateType}</TableCell>
									<TableCell>
										<Chip
											label={log.action}
											color={getActionColor(log.action)}
											size="small"
										/>
									</TableCell>
									<TableCell>{log.userId}</TableCell>
									<TableCell>
										<Chip
											label={log.status}
											color={getStatusColor(log.status)}
											size="small"
										/>
									</TableCell>
									<TableCell>{formatDateTime(log.createdAt)}</TableCell>
								</TableRow>
								<TableRow>
									<TableCell
										style={{ paddingBottom: 0, paddingTop: 0 }}
										colSpan={8}
									>
										<Collapse
											in={expandedRow === log.id}
											timeout="auto"
											unmountOnExit
										>
											<Box sx={{ margin: 2 }}>
												<Typography variant="h6" gutterBottom>
													Metadata
												</Typography>
												<Card variant="outlined">
													<CardContent>
														<pre style={{ margin: 0, fontSize: "0.875rem" }}>
															{JSON.stringify(log.metadata, null, 2)}
														</pre>
													</CardContent>
												</Card>
												{log.ipAddress && (
													<Typography variant="body2" sx={{ mt: 1 }}>
														<strong>IP Address:</strong> {log.ipAddress}
													</Typography>
												)}
												{log.userAgent && (
													<Typography variant="body2">
														<strong>User Agent:</strong> {log.userAgent}
													</Typography>
												)}
											</Box>
										</Collapse>
									</TableCell>
								</TableRow>
							</>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				rowsPerPageOptions={[5, 10, 25]}
				component="div"
				count={totalCount}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</Box>
	);
}
