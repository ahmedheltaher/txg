import type { NotificationSeverity } from "@/types";
import { useCallback, useState } from "react";

interface Notification {
	open: boolean;
	message: string;
	severity: NotificationSeverity;
}

export function useNotification() {
	const [notification, setNotification] = useState<Notification>({
		open: false,
		message: "",
		severity: "info",
	});

	const showNotification = useCallback(
		(message: string, severity: NotificationSeverity = "info") => {
			setNotification({ open: true, message, severity });
		},
		[]
	);

	const hideNotification = useCallback(() => {
		setNotification((prev) => ({ ...prev, open: false }));
	}, []);

	return {
		notification,
		showNotification,
		hideNotification,
	};
}
