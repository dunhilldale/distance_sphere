import { describe, it, expect, beforeAll } from "bun:test";
import { generateToken } from "./../src/utils/auth.util";
import jwt from "jsonwebtoken";

// import { Sequelize } from "sequelize-typescript";
// import sequelize from '../src/config/database-test';

const JWT_SECRET = process.env.JWT_SECRET ?? "";
// beforeAll(async () => {});

describe("Authentication", () => {
    const token = generateToken({ id: 1, email: "test@user.com", isTest: true });
    it("able to get a token from a test user", async () => {
        expect(token).toBeString();
    });
    it("valid user payload", async () => {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        expect(payload).toBeObject();
        expect(payload.id).toBeInteger();
    });
});