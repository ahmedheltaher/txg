export function formatCurrency(amount: number, currency: string): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(amount);
}

export function formatDateTime(date: string): string {
	return new Date(date).toLocaleString();
}
