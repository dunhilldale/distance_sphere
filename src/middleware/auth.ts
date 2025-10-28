import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.util";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  id: number;
  email: string;
  isTest?: boolean;
}

// attach to Express.Request
declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
  }
}

// Validate JWT and attach user; reusable by all routes.
// Also sets req.user.isTest if token has test claim.
export function validateUser(jwtSecret: string) {
  console.log("jwtSecret: ", jwtSecret);
  return (req: Request, res: Response, next: NextFunction) => {
    const h = req.header("authorization");
    if (!h) return res.status(401).json({ error: "missing auth" });

    const parts = h.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "invalid auth header" });
    }

    const token = parts[1] ?? "";

    try {
      const payload = jwt.verify(token, jwtSecret) as any;
      req.user = {
        id: payload.id,
        email: payload.email,
        isTest: !!payload.isTest,
      };
      next();
    } catch (err) {
      return res.status(401).json({ error: "invalid token" });
    }
  };
}
