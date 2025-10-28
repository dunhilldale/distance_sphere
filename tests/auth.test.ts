import { describe, it, expect, beforeAll } from "bun:test";
import { generateToken } from "./../src/utils/auth.util";

// import { Sequelize } from "sequelize-typescript";
// import sequelize from '../src/config/database-test';

const JWT_SECRET = process.env.JWT_SECRET ?? "";
// beforeAll(async () => {});

describe("Authentication", () => {
    it("able to get a token from a test user", async () => {
        const token = generateToken({ id: 1, email: "test@user.com", isTest: true });
        // console.log(token);
        expect(token).toBeString();
    });
});