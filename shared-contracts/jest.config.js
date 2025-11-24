module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src", "<rootDir>/__tests__"],
	testMatch: [
		"**/__tests__/**/*.+(spec|test).+(ts|tsx|js)",
		"**/?(*.)+(spec|test).+(ts|tsx|js)",
	],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	collectCoverageFrom: [
		"src/**/*.{ts,js}",
		"!src/**/*.d.ts",
		"!src/server.ts",
		"!src/**/index.ts",
	],
	coverageDirectory: "coverage",
	setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
};
