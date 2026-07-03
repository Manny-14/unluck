import { prisma } from "../prisma";
import { calculateCurrentStreak } from "../streak";

/**
 * Seeds default identities and habits for a new user if they have none.
 */
async function seedUserIfNeeded(userId: string): Promise<void> {
  const habitCount = await prisma.habit.count({ where: { userId } });
  if (habitCount > 0) return;

  console.log(`[db]: User ${userId} has no habits. Seeding default data...`);
  
  const musician = await prisma.identity.create({
    data: { name: "Musician", userId: userId },
  });

  const writer = await prisma.identity.create({
    data: { name: "Writer", userId: userId },
  });

  await prisma.habit.createMany({
    data: [
      {
        title: "Practice guitar chords",
        description: "15 minutes after morning tea",
        userId: userId,
        identityId: musician.id,
      },
      {
        title: "Write 500 words",
        description: "Drafting next article in the morning",
        userId: userId,
        identityId: writer.id,
      },
      {
        title: "Drink 3L of water",
        description: "Keep a water bottle on the desk",
        userId: userId,
      },
    ],
  });
}

export interface DashboardData {
  habits: Array<{
    id: string;
    title: string;
    description: string;
    identityId: string | null;
    isCompleted: boolean;
    currentStreak: number;
  }>;
  identities: Array<{
    id: string;
    name: string;
    level: string;
    votes: number;
  }>;
}

export async function getDashboardData(userId: string, date: string): Promise<DashboardData> {
  await seedUserIfNeeded(userId);

  const habits = await prisma.habit.findMany({
    where: { userId, isArchived: false },
    include: { logs: true },
  });

  const habitsResponse = habits.map((habit) => {
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

  const userIdentities = await prisma.identity.findMany({
    where: { userId },
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

  return {
    habits: habitsResponse,
    identities: identitiesWithVotes,
  };
}

export interface ToggleResponse {
  habitId: string;
  isCompleted: boolean;
  currentStreak: number;
  identityId: string | null;
  identityVotes: number;
}

export async function toggleHabit(userId: string, habitId: string, date: string): Promise<ToggleResponse> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: { logs: true },
  });

  if (!habit || habit.userId !== userId) {
    throw new Error("Habit not found");
  }

  const existingLog = habit.logs.find((log) => log.localDate === date);
  let isCompleted = false;

  if (existingLog) {
    await prisma.habitLog.delete({
      where: { id: existingLog.id },
    });
    isCompleted = false;
  } else {
    await prisma.habitLog.create({
      data: {
        habitId: habitId,
        localDate: date,
      },
    });
    isCompleted = true;
  }

  const updatedLogs = await prisma.habitLog.findMany({
    where: { habitId: habitId },
  });
  const currentStreak = calculateCurrentStreak(updatedLogs, date);

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

  return {
    habitId,
    isCompleted,
    currentStreak,
    identityId: habit.identityId || null,
    identityVotes,
  };
}
