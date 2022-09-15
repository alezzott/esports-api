import express from "express";
import cors from "cors";

import { PrismaClient } from "@prisma/client";
import { ConvertHoursToMinutes } from "./services/ConvertHoursToMinutes";
import { ConvertMinutesToHours } from "./services/ConvertMinutesToHours";

const app = express();

app.use(express.json());
app.use(cors({}));

const prisma = new PrismaClient({
  log: ["query"],
});

app.get("/games", async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return res.json(games);
});

app.post("/games/:gameId/ads", async (req, res) => {
  const gameId = req.params.gameId;
  const body = req.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(","),
      hourStart: ConvertHoursToMinutes(body.hourStart),
      hourEnd: ConvertHoursToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    },
  });

  return res.status(201).json(ad);
});

app.get("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },

    orderBy: {
      createdAt: "desc",
    },

    where: {
      gameId,
    },
  });

  return res.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(","),
        hourStart: ConvertMinutesToHours(ad.hourStart),
        hourEnd: ConvertMinutesToHours(ad.hourEnd),
      };
    })
  );
});

app.get("/games/:id/discord", async (req, res) => {
  const adId = req.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });

  return res.json({
    discord: ad.discord,
  });
});

app.listen(3333);
