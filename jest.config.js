module.exports = {
    testEnvironment: "node",
    testTimeout: 120000, // Increased from 60000 to 120000
    setupFilesAfterEnv: ["./jest.setup.js"],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    detectOpenHandles: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: ["/node_modules/", "/config/", "/tests/"],
    coverageThreshold: {
        global: {
            statements: 40,
            branches: 15,
            functions: 20,
            lines: 40,
        },
    },
}
