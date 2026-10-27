import type { SpotifyListeningHistoryDTO } from "@/platforms/spotify/types";
import prisma from "@/utils/prisma.util";
import type { ListeningHistory } from "@prisma/client";

export const saveListeningHistory = async (
  listeningHistory: SpotifyListeningHistoryDTO,
  trackId: string,
  userId: string,
): Promise<ListeningHistory> => {
  try {
    return await prisma.listeningHistory.create({
      data: {
        userId,
        platformName: listeningHistory.platformName,
        trackId,
        playedAt: listeningHistory.playedAt,
        source: listeningHistory.source,
        uploadedAt: listeningHistory.uploadedAt,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      // Reuse an existing event instead of retrying the same unique insert.
      const existingEntry = await prisma.listeningHistory.findUnique({
        where: {
          userId_trackId_playedAt: {
            userId,
            trackId,
            playedAt: listeningHistory.playedAt,
          },
        },
      });

      if (existingEntry) {
        return existingEntry;
      }
    }

    throw error;
  }
};

export const getListeningHistoryForPeriod = (
  userId: string,
  start: Date,
  end: Date,
) =>
  prisma.listeningHistory.findMany({
    where: {
      userId,
      playedAt: { gte: start, lt: end },
    },
    select: {
      track: { select: { durationMs: true } },
    },
  });