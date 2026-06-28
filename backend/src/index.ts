import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { calculateCurrentStreak } from "./streak";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Helper to seed database if empty
async function seedIfNeeded() {
  const userCount = await prisma.user.count();
  if (userCount > 0) return;

  console.log("[db]: Database is empty. Seeding default data...");
  const user = await prisma.user.create({
    data: {
      email: "emmanuel@example.com",
      name: "Emmanuel",
    },
  });

  const musician = await prisma.identity.create({
    data: {
      name: "Musician",
      userId: user.id,
    },
  });

  const writer = await prisma.identity.create({
    data: {
      name: "Writer",
      userId: user.id,
    },
  });

  await prisma.habit.createMany({
    data: [
      {
        title: "Practice guitar chords",
        description: "15 minutes after morning tea",
        userId: user.id,
        identityId: musician.id,
      },
      {
        title: "Write 500 words",
        description: "Drafting next article in the morning",
        userId: user.id,
        identityId: writer.id,
      },
      {
        title: "Drink 3L of water",
        description: "Keep a water bottle on the desk",
        userId: user.id,
      },
    ],
  });
  console.log("[db]: Seeding completed successfully.");
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Unluck Backend API is running successfully.",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/habits?date=YYYY-MM-DD
app.get("/api/habits", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== "string") {
      return res.status(400).json({ error: "Missing required query parameter: date (YYYY-MM-DD)" });
    }

    // Ensure database has default data
    await seedIfNeeded();

    // Get the default user (first user)
    const user = await prisma.user.findFirst();
    if (!user) {
      return res.status(404).json({ error: "No user found" });
    }

    // Fetch habits with their logs
    const habits = await prisma.habit.findMany({
      where: { userId: user.id, isArchived: false },
      include: {
        logs: true,
      },
    });

    const response = habits.map((habit) => {
      const isCompleted = habit.logs.some((log) => log.localDate === date);
      const currentStreak = calculateCurrentStreak(habit.logs, date);

      return {
        id: habit.id,
        title: habit.title,
        description: habit.description || "",
        identityId: habit.identityId || null,
        isCompleted,
        currentStreak,
      };
    });

    // Fetch user's identities and compute votes & level
    const userIdentities = await prisma.identity.findMany({
      where: { userId: user.id },
    });

    const identitiesWithVotes = await Promise.all(
      userIdentities.map(async (identity) => {
        const identityHabits = await prisma.habit.findMany({
          where: { identityId: identity.id },
          select: { id: true },
        });
        const habitIds = identityHabits.map((h) => h.id);
        const votes = await prisma.habitLog.count({
          where: { habitId: { in: habitIds } },
        });

        let level = "Novice";
        if (votes >= 10) level = "Expert";
        else if (votes >= 5) level = "Amateur";
        else if (votes >= 2) level = "Beginner";

        return {
          id: identity.id,
          name: identity.name,
          level,
          votes,
        };
      })
    );

    res.json({
      habits: response,
      identities: identitiesWithVotes,
    });
  } catch (error: any) {
    console.error("Error fetching habits:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/habits/:id/toggle
// Request body: { date: "YYYY-MM-DD" }
app.post("/api/habits/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    if (!date || typeof date !== "string") {
      return res.status(400).json({ error: "Missing required body parameter: date (YYYY-MM-DD)" });
    }

    const habit = await prisma.habit.findUnique({
      where: { id },
      include: { logs: true },
    });

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    // Check if a log already exists for this habit on this local date
    const existingLog = habit.logs.find((log) => log.localDate === date);
    let isCompleted = false;

    if (existingLog) {
      // Uncheck it: delete the log
      await prisma.habitLog.delete({
        where: { id: existingLog.id },
      });
      isCompleted = false;
    } else {
      // Check it: create a new log
      await prisma.habitLog.create({
        data: {
          habitId: id,
          localDate: date,
        },
      });
      isCompleted = true;
    }

    // Re-fetch all logs to calculate the updated streak
    const updatedLogs = await prisma.habitLog.findMany({
      where: { habitId: id },
    });
    const currentStreak = calculateCurrentStreak(updatedLogs, date);

    // If this habit is linked to an identity, count the total votes (all logs for all habits under this identity)
    let identityVotes = 0;
    if (habit.identityId) {
      const identityHabits = await prisma.habit.findMany({
        where: { identityId: habit.identityId },
        select: { id: true },
      });
      const habitIds = identityHabits.map((h) => h.id);
      identityVotes = await prisma.habitLog.count({
        where: { habitId: { in: habitIds } },
      });
    }

    res.json({
      habitId: id,
      isCompleted,
      currentStreak,
      identityId: habit.identityId || null,
      identityVotes,
    });
  } catch (error: any) {
    console.error("Error toggling habit:", error);
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
  });
}

export { app, prisma };

