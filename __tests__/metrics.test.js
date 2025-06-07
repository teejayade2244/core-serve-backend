const request = require("supertest")
const { app } = require("../index")
const { metrics } = require("../config/metricsConfig")
const { setupTestDB } = require("./testUtils")

describe("Prometheus Metrics", () => {
    setupTestDB()

    beforeEach(async () => {
        // Reset metrics before each test
        Object.values(metrics).forEach((metric) => {
            if (metric.reset) metric.reset()
        })
    })

    test("metrics endpoint should return 200", async () => {
        const response = await request(app)
            .get("/metrics")
            .expect("Content-Type", /text\/plain/)
        expect(response.status).toBe(200)
    })

    test("metrics should include custom metrics", async () => {
        const response = await request(app).get("/metrics")
        expect(response.text).toMatch(
            /core_serve_http_request_duration_seconds/
        )
        expect(response.text).toMatch(/core_serve_total_users/)
    })

    test("http duration metric should be updated after requests", async () => {
        await request(app).get("/healthz")
        const metricsResponse = await request(app).get("/metrics")
        expect(metricsResponse.text).toMatch(/http_request_duration_seconds/)
        expect(metricsResponse.text).toMatch(/method="GET"/)
        expect(metricsResponse.text).toMatch(/route="\/healthz"/)
    })

    test("total users metric should be updated after user registration", async () => {
        const testUser = {
            email: "test@example.com",
            Password: "Test123!",
            firstname: "Test",
            lastname: "User",
            mobile: "1234567890",
            matric: "TEST123",
            gender: "Male",
            address: "Test Address",
            school: "Test University",
            course: "Computer Science",
            stateOfOrigin: "Test State",
            qualification: "BSc",
            from: "2023",
            to: "2024",
            status: "Active",
            Batch: "A",
        }

        const response = await request(app)
            .post("/api/user/register")
            .send(testUser)

        expect(response.status).toBe(201)

        const metricsResponse = await request(app).get("/metrics")
        const match = metricsResponse.text.match(
            /core_serve_total_users\s+(\d+)/
        )
        const userCount = match ? parseInt(match[1]) : 0
        expect(userCount).toBe(1)
    })

    test("login total metric should increment after successful login", async () => {
        const testUser = {
            email: "test@example.com",
            Password: "Test123!",
            firstname: "Test",
            lastname: "User",
            mobile: "1234567890",
            matric: "TEST123",
            gender: "Male",
            address: "Test Address",
            school: "Test University",
            course: "Computer Science",
            stateOfOrigin: "Test State",
            qualification: "BSc",
            from: "2023",
            to: "2024",
            status: "Active",
            Batch: "A",
        }

        await request(app).post("/api/user/register").send(testUser)

        const loginResponse = await request(app).post("/api/user/login").send({
            email: testUser.email,
            Password: testUser.Password,
        })

        expect(loginResponse.status).toBe(200)

        const metricsResponse = await request(app).get("/metrics")
        const match = metricsResponse.text.match(
            /core_serve_login_total\s+(\d+)/
        )
        const loginCount = match ? parseInt(match[1]) : 0
        expect(loginCount).toBe(1)
    })
})
