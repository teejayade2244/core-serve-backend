const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index").app;
const User = require("../models/userDetails");

let mongoServer;

const testUser = {
    firstname: "Test",
    lastname: "User",
    email: "test@example.com",
    Password: "Test123!@",
    mobile: "1234567890",
    gender: "Male",
    school: "Test University",
    OrientationCamp: "Test Camp",
    statePostedTo: "Test State",
    StateCode: "TS/22A/1234",
    address: "Test Address",
    course: "Test Course",
    stateOfOrigin: "Test State",
    matric: "12345",
    qualification: "BSc",
    from: "2023",
    to: "2024",
    status: "Active",
    CallUpNumber: "NYSC/2023/123456",
    Batch: "A"
};

describe("User API Endpoints", () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = await mongoServer.getUri();
        await mongoose.disconnect();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe("POST /api/user/register", () => {
        it("should create a new user", async () => {
            const response = await request(app)
                .post("/api/user/register")
                .send(testUser);

            expect(response.status).toBe(201);
        });

        it("should not create user with existing email", async () => {
            await User.create(testUser);
            const response = await request(app)
                .post("/api/user/register")
                .send(testUser);

            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty("error");
        });

        it("should not create user with invalid email format", async () => {
            const invalidUser = { ...testUser, email: "invalid-email" };
            const response = await request(app)
                .post("/api/user/register")
                .send(invalidUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });

        it("should not create user with missing required fields", async () => {
            const incompleteUser = { email: testUser.email };
            const response = await request(app)
                .post("/api/user/register")
                .send(incompleteUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });

    describe("POST /api/user/login", () => {
        it("should login with valid credentials", async () => {
            await User.create(testUser);
            const response = await request(app)
                .post("/api/user/login")
                .send({
                    email: testUser.email,
                    Password: testUser.Password
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
        });

        it("should not login with invalid credentials", async () => {
            const response = await request(app)
                .post("/api/user/login")
                .send({
                    email: "test@example.com",
                    Password: "wrongpassword"
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error");
        });

        it("should not login with missing credentials", async () => {
            const response = await request(app)
                .post("/api/user/login")
                .send({ email: testUser.email });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error");
        });
    });
});
