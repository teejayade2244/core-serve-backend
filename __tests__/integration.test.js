const request = require("supertest")
const { app } = require("../index")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

describe("API Integration Tests", () => {
    test("protected route should return 401 without token", async () => {
        const response = await request(app)
            .get("/api/user/all-users") // Using an existing protected route
            .expect(401)

        expect(response.body).toHaveProperty(
            "message",
            "Not Authorized, No Token"
        )
    })

    test("error handler should handle validation errors", async () => {
        const response = await request(app)
            .post("/api/user/register")
            .send({
                email: "test@example.com",
                // Missing required fields
            })
            .expect(500) // Your current error handler returns 500 for validation errors

        expect(response.body).toHaveProperty(
            "error",
            "Error while registering user"
        )
    })

    test("metrics middleware should record request duration", async () => {
        // First request to generate metrics
        await request(app).get("/metrics").expect(200)

        // Second request to check recorded metrics
        const metricsResponse = await request(app).get("/metrics").expect(200)

        expect(metricsResponse.text).toMatch(/http_request_duration_seconds/)
        expect(metricsResponse.text).toMatch(/method="GET"/)
    })

    test("auth middleware should protect routes", async () => {
        // Create a valid token with proper payload
        const token = jwt.sign(
            { id: new mongoose.Types.ObjectId(), email: "test@example.com" },
            process.env.JWT_SECRET || "test-secret"
        )

        // Test with invalid token
        await request(app)
            .get("/api/user/all-users")
            .set("Authorization", "Bearer invalid-token")
            .expect(401)
            .expect((res) => {
                expect(res.body).toHaveProperty(
                    "message",
                    "Not Authorized, Please Login"
                )
            })

        // Test with valid token
        await request(app)
            .get("/api/user/all-users")
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
    })

    test("admin routes should require admin privileges", async () => {
        const userToken = jwt.sign(
            {
                id: new mongoose.Types.ObjectId(),
                email: "user@example.com",
                role: "user",
            },
            process.env.JWT_SECRET || "test-secret"
        )

        const adminToken = jwt.sign(
            {
                id: new mongoose.Types.ObjectId(),
                email: "admin@example.com",
                role: "admin",
            },
            process.env.JWT_SECRET || "test-secret"
        )

        // Test user access to admin route
        await request(app)
            .put("/api/user/update/test@example.com")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ status: "updated" })
            .expect(403)

        // Test admin access to admin route
        await request(app)
            .put("/api/user/update/test@example.com")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ status: "updated" })
            .expect(200)
    })
})
