import type { Request, Response, NextFunction } from "express";
import { ApiError } from "@/errors/ApiError";
import { getPlatformAdapter } from "@/platforms/registry";
import type { Platform } from "@/models/connectedPlatforms/types";

export const platformCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { platform } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "UNAUTHENTICATED", "No authenticated user");
    }

    const adapter = getPlatformAdapter(platform as Platform);

    await adapter.handleCallback(userId, req.query);

    // Import history before redirecting so the dashboard has data immediately.
    if (adapter.getHistory) {
      await adapter.getHistory(userId);
    }

    const frontendUrl = (
      process.env.FRONTEND_URL || "http://127.0.0.1:5500"
    ).replace(/\/$/, "");

    res.redirect(`${frontendUrl}/dashboard.html`);
  } catch (error) {
    next(error);
  }
};