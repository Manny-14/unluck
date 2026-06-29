import { prisma } from "../prisma";
import { calculateCurrentStreak } from "../streak";

/**
 * Seeds a default user, identities, and habits if the database has no records.
 */
export async function seedIfNeeded(): Promise<void> {
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

/**
 * Fetches active habits, completes log flags, calculates streaks, and returns dashboard details.
 */
export async function getDashboardData(date: string): Promise<DashboardData> {
  // Ensure database has default data
  await seedIfNeeded();

  // Get the default user (first user)
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error("No user found in the database.");
  }

  // Fetch habits with their logs
  const habits = await prisma.habit.findMany({
    where: { userId: user.id, isArchived: false },
    include: {
      logs: true,
    },
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

/**
 * Toggles completion status (checks/unchecks log) for a specific local date and updates votes.
 */
export async function toggleHabit(habitId: string, date: string): Promise<ToggleResponse> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: { logs: true },
  });

  if (!habit) {
    throw new Error("Habit not found");
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
        habitId: habitId,
        localDate: date,
      },
    });
    isCompleted = true;
  }

  // Re-fetch all logs to calculate the updated streak
  const updatedLogs = await prisma.habitLog.findMany({
    where: { habitId: habitId },
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

  return {
    habitId,
    isCompleted,
    currentStreak,
    identityId: habit.identityId || null,
    identityVotes,
  };
}
