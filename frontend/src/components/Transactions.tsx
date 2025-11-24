import { CURRENCIES, TRANSACTION_STATUSES } from "@/config/constants";
import { usePagination } from "@/hooks/usePagination";
import { transactionService } from "@/services/transactionService";
import type {
	NotificationSeverity,
	Transaction,
	TransactionFormData,
	TransactionStatus,
} from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
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

interface TransactionsProps {
	onNotification: (message: string, severity: NotificationSeverity) => void;
}

export default function Transactions({ onNotification }: TransactionsProps) {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [_loading, setLoading] = useState(false);
	const [totalCount, setTotalCount] = useState(0);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<Transaction | null>(null);
	const [formData, setFormData] = useState<TransactionFormData>({
		amount: "",
		currency: "USD",
		description: "",
		status: "PENDING",
	});

	const { page, rowsPerPage, handleChangePage, handleChangeRowsPerPage } =
		usePagination();

	const fetchTransactions = useCallback(async () => {
		setLoading(true);
		try {
			const data = await transactionService.getTransactions(
				page + 1,
				rowsPerPage
			);
			setTransactions(data.data);
			setTotalCount(data.total);
		} catch (error) {
			onNotification("Failed to fetch transactions", "error");
		} finally {
			setLoading(false);
		}
	}, [page, rowsPerPage, onNotification]);

	useEffect(() => {
		fetchTransactions();
	}, [fetchTransactions]);

	const handleCreateTransaction = async () => {
		try {
			await transactionService.createTransaction({
				amount: parseFloat(formData.amount),
				currency: formData.currency,
				description: formData.description,
			});

			onNotification("Transaction created successfully!", "success");
			setDialogOpen(false);
			resetForm();
			fetchTransactions();
		} catch (error) {
			onNotification("Failed to create transaction", "error");
		}
	};

	const handleUpdateTransaction = async () => {
		if (!selectedTransaction) return;

		try {
			await transactionService.updateTransaction(selectedTransaction.id, {
				status: formData.status,
			});

			onNotification("Transaction updated successfully!", "success");
			setDialogOpen(false);
			setSelectedTransaction(null);
			fetchTransactions();
		} catch (error) {
			onNotification("Failed to update transaction", "error");
		}
	};

	const handleDeleteTransaction = async (id: string) => {
		if (!window.confirm("Are you sure you want to delete this transaction?")) {
			return;
		}

		try {
			await transactionService.deleteTransaction(id);
			onNotification("Transaction deleted successfully!", "success");
			fetchTransactions();
		} catch (error) {
			onNotification("Failed to delete transaction", "error");
		}
	};

	const resetForm = () => {
		setFormData({
			amount: "",
			currency: "USD",
			description: "",
			status: "PENDING",
		});
	};

	const openCreateDialog = () => {
		resetForm();
		setSelectedTransaction(null);
		setDialogOpen(true);
	};

	const openEditDialog = (transaction: Transaction) => {
		setSelectedTransaction(transaction);
		setFormData({
			amount: transaction.amount.toString(),
			currency: transaction.currency,
			description: transaction.description || "",
			status: transaction.status,
		});
		setDialogOpen(true);
	};

	const openViewDialog = (transaction: Transaction) => {
		setSelectedTransaction(transaction);
		setViewDialogOpen(true);
	};

	const getStatusColor = (status: TransactionStatus) => {
		const colors = {
			PENDING: "warning",
			COMPLETED: "success",
			FAILED: "error",
			CANCELLED: "default",
		} as const;
		return colors[status] || "default";
	};

	return (
		<Box>
			<Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
				<Typography variant="h4">Transactions</Typography>
				<Button
					variant="contained"
					startIcon={<Add />}
					onClick={openCreateDialog}
				>
					New Transaction
				</Button>
			</Box>

			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Amount</TableCell>
							<TableCell>Currency</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Description</TableCell>
							<TableCell>Created</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{transactions.map((transaction) => (
							<TableRow key={transaction.id}>
								<TableCell>{transaction.id}</TableCell>
								<TableCell>
									{formatCurrency(transaction.amount, transaction.currency)}
								</TableCell>
								<TableCell>{transaction.currency}</TableCell>
								<TableCell>
									<Chip
										label={transaction.status}
										color={getStatusColor(transaction.status)}
										size="small"
									/>
								</TableCell>
								<TableCell>{transaction.description || "-"}</TableCell>
								<TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
								<TableCell>
									<IconButton
										size="small"
										onClick={() => openViewDialog(transaction)}
									>
										<Visibility />
									</IconButton>
									<IconButton
										size="small"
										onClick={() => openEditDialog(transaction)}
									>
										<Edit />
									</IconButton>
									<IconButton
										size="small"
										onClick={() => handleDeleteTransaction(transaction.id)}
										disabled={transaction.status === "COMPLETED"}
									>
										<Delete />
									</IconButton>
								</TableCell>
							</TableRow>
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

			{/* Create/Edit Dialog */}
			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					{selectedTransaction ? "Edit Transaction" : "Create New Transaction"}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
						{!selectedTransaction && (
							<>
								<TextField
									label="Amount"
									type="number"
									value={formData.amount}
									onChange={(e) =>
										setFormData({ ...formData, amount: e.target.value })
									}
									required
								/>
								<TextField
									select
									label="Currency"
									value={formData.currency}
									onChange={(e) =>
										setFormData({
											...formData,
											currency: e.target.value as any,
										})
									}
								>
									{CURRENCIES.map((currency) => (
										<MenuItem key={currency} value={currency}>
											{currency}
										</MenuItem>
									))}
								</TextField>
								<TextField
									label="Description"
									multiline
									rows={3}
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
								/>
							</>
						)}
						{selectedTransaction && (
							<TextField
								select
								label="Status"
								value={formData.status}
								onChange={(e) =>
									setFormData({
										...formData,
										status: e.target.value as TransactionStatus,
									})
								}
							>
								{TRANSACTION_STATUSES.map((status) => (
									<MenuItem key={status} value={status}>
										{status}
									</MenuItem>
								))}
							</TextField>
						)}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={
							selectedTransaction
								? handleUpdateTransaction
								: handleCreateTransaction
						}
						variant="contained"
					>
						{selectedTransaction ? "Update" : "Create"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* View Dialog */}
			<Dialog
				open={viewDialogOpen}
				onClose={() => setViewDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Transaction Details</DialogTitle>
				<DialogContent>
					{selectedTransaction && (
						<Card variant="outlined">
							<CardContent>
								<Grid container spacing={2}>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											ID
										</Typography>
										<Typography variant="body1">
											{selectedTransaction.id}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											User ID
										</Typography>
										<Typography variant="body1">
											{selectedTransaction.userId}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Amount
										</Typography>
										<Typography variant="body1">
											{formatCurrency(
												selectedTransaction.amount,
												selectedTransaction.currency
											)}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Status
										</Typography>
										<Chip
											label={selectedTransaction.status}
											color={getStatusColor(selectedTransaction.status)}
											size="small"
										/>
									</Grid>
									<Grid item xs={12}>
										<Typography variant="body2" color="text.secondary">
											Description
										</Typography>
										<Typography variant="body1">
											{selectedTransaction.description || "No description"}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Created
										</Typography>
										<Typography variant="body1">
											{formatDateTime(selectedTransaction.createdAt)}
										</Typography>
									</Grid>
									<Grid item xs={6}>
										<Typography variant="body2" color="text.secondary">
											Updated
										</Typography>
										<Typography variant="body1">
											{formatDateTime(selectedTransaction.updatedAt)}
										</Typography>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setViewDialogOpen(false)}>Close</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
