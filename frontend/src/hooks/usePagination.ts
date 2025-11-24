import { useCallback, useState } from "react";

export function usePagination(initialRowsPerPage = 10) {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

	const handleChangePage = useCallback((_: unknown, newPage: number) => {
		setPage(newPage);
	}, []);

	const handleChangeRowsPerPage = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setRowsPerPage(parseInt(event.target.value, 10));
			setPage(0);
		},
		[]
	);

	const resetPage = useCallback(() => {
		setPage(0);
	}, []);

	return {
		page,
		rowsPerPage,
		handleChangePage,
		handleChangeRowsPerPage,
		resetPage,
	};
}
