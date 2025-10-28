import { Router } from "express";
import type { Request, Response } from "express";
import { generateToken } from "../utils/auth.util";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 🧠 For simplicity, simulate a user lookup (replace with DB query)

  if (email === "test@user.com" && password === "password") {
    const token = generateToken({ id: 1, email, isTest: true });
    return res.json({ token });
  }

  if (email === "user@example.com" && password === "password") {
    const token = generateToken({ id: 2, email });
    return res.json({ token });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

export default router;
