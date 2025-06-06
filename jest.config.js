module.exports = {
    testEnvironment: "node",
    preset: "@shelf/jest-mongodb",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    coverageThreshold: {
        global: {
            branches: 15,
            functions: 20,
            lines: 40,
            statements: 40,
        },
    },
    testMatch: ["**/__tests__/**/*.test.js"],
    verbose: true,
}
