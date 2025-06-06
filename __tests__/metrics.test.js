const request = require("supertest")
const { app } = require("../index")
const { metrics } = require("../config/metricsConfig")
const User = require("../models/userDetails")
const {
    connectTestDB,
    disconnectTestDB,
    clearTestDB,
} = require("../config/testDb")

describe("Prometheus Metrics", () => {
    beforeAll(async () => {
        await connectTestDB()
    })

    beforeEach(async () => {
        await clearTestDB()
        await metrics.activeLogins.reset()
        await metrics.totalUsers.reset()
    })

    afterAll(async () => {
        await disconnectTestDB()
    })

    test("metrics endpoint should return 200", async () => {
        const response = await request(app)
            .get("/metrics")
            .expect("Content-Type", /text/)
        expect(response.status).toBe(200)
    })

    test("metrics should include custom metrics", async () => {
        const response = await request(app).get("/metrics")
        expect(response.text).toMatch(
            /core_serve_http_request_duration_seconds/
        )
        expect(response.text).toMatch(/core_serve_total_users/)
        expect(response.text).toMatch(/core_serve_login_total/)
    })

    test("http duration metric should be updated after requests", async () => {
        const response = await request(app).get("/healthz")
        expect(response.status).toBe(200)

        const metricsResponse = await request(app).get("/metrics")
        expect(metricsResponse.text).toMatch(/http_request_duration_seconds/)
        expect(metricsResponse.text).toMatch(/method="GET"/)
        expect(metricsResponse.text).toMatch(/route="\/healthz"/)
    })

    test("total users metric should be updated after user registration", async () => {
        const user = {
            firstname: "Test",
            lastname: "User",
            email: "test@example.com",
            password: "Password123!",
            mobile: "1234567890",
            role: "user",
            Password: "Password123!", // Note: case sensitive
            Batch: "2023A",
            to: "2024",
            from: "2023",
            status: "active",
            qualification: "BSc",
            matric: "12345",
            stateOfOrigin: "Lagos",
            course: "Computer Science",
            address: "123 Test Street",
            school: "Test University",
            gender: "Male",
        }

        const registerResponse = await request(app)
            .post("/api/user/register")
            .send(user)

        if (registerResponse.status !== 201) {
            console.log("Registration failed:", registerResponse.body)
        }

        expect(registerResponse.status).toBe(201)

        const metricsResponse = await request(app).get("/metrics")
        const userCount = Number(
            metricsResponse.text.match(/core_serve_total_users\s+(\d+)/)?.[1] ||
                0
        )
        expect(userCount).toBe(1)
    })

    test("login total metric should increment after successful login", async () => {
        // Create test user with all required fields
        const user = {
            firstname: "Test",
            lastname: "User",
            email: "login@test.com",
            password: "Password123!",
            mobile: "1234567890",
            role: "user",
            Password: "Password123!", // Note: case sensitive
            Batch: "2023A",
            to: "2024",
            from: "2023",
            status: "active",
            qualification: "BSc",
            matric: "12345",
            stateOfOrigin: "Lagos",
            course: "Computer Science",
            address: "123 Test Street",
            school: "Test University",
            gender: "Male",
        }

        // Register first
        const registerResponse = await request(app)
            .post("/api/user/register")
            .send(user)

        expect(registerResponse.status).toBe(201)

        // Then login
        const loginResponse = await request(app).post("/api/user/login").send({
            email: user.email,
            Password: user.Password, // Note: case sensitive
        })

        expect(loginResponse.status).toBe(200)

        const metricsResponse = await request(app).get("/metrics")
        const loginCount = Number(
            metricsResponse.text.match(/core_serve_login_total\s+(\d+)/)?.[1] ||
                0
        )
        expect(loginCount).toBe(1)
    })
})
