import type { Request, Response } from "express";
import { authenticateUser } from "@/services/auth/authenticateUser.service";

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await authenticateUser(
    email,
    password,
  );

  const isProduction = process.env.NODE_ENV === "production";

  const refreshCookieName = isProduction
    ? "__Secure-refresh"
    : "refreshToken";

  const sessionCookieName = isProduction
    ? "__Host-session"
    : "accessToken";

  res.cookie(refreshCookieName, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie(sessionCookieName, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({
    message: "Successfully logged in",
  });
};