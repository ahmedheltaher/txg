import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3002,
		proxy: {
			"/api/transactions": {
				target: "http://localhost:3000",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/transactions/, ""),
			},
			"/api/audit": {
				target: "http://localhost:3001",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/audit/, ""),
			},
		},
	},
});
