module.exports = {
    testEnvironment: "node",
    testTimeout: 120000,
    setupFilesAfterEnv: ["./jest.setup.js"],
    verbose: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/config/",
        "/coverage/",
        "/dist/",
        "/docs/",
    ],
    testPathIgnorePatterns: [
        "/node_modules/",
        "/config/",
        "/coverage/",
        "/dist/",
        "/docs/",
    ],
    moduleFileExtensions: ["js", "json"],
    testMatch: ["**/__tests__/**/*.test.js"],
}
