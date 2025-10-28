import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
console.log(JWT_SECRET);

interface JwtPayload {
  id: number;
  email: string;
  isTest?: boolean;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
