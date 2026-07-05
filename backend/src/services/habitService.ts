import { prisma } from "../prisma";

export interface CreateHabitInput {
  title: string;
  description?: string;
  identityId?: string;
  timeOfDay?: string;
  location?: string;
  temptationWant?: string;
  recurrenceDays?: string;
}

/**
 * Retrieves all active (non-archived) habit blueprints for a specific user.
 */
export async function getHabits(userId: string) {
  return await prisma.habit.findMany({
    where: {
      userId,
      isArchived: false,
    },
    orderBy: { createdAt: "desc" },
    include: {
      identity: true,
    }
  });
}

/**
 * Creates a new Habit blueprint in the database.
 */
export async function createHabit(userId: string, data: CreateHabitInput) {
  return await prisma.habit.create({
    data: {
      userId,
      ...data,
    },
  });
}

/**
 * Updates an existing Habit blueprint. Ensures the habit belongs to the user.
 */
export async function updateHabit(userId: string, habitId: string, data: Partial<CreateHabitInput>) {
  const existing = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Habit not found");
  }

  return await prisma.habit.update({
    where: { id: habitId },
    data,
  });
}

/**
 * Archives a habit so it stops generating tasks, preserving historical task data.
 */
export async function archiveHabit(userId: string, habitId: string) {
  const existing = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Habit not found");
  }

  return await prisma.habit.update({
    where: { id: habitId },
    data: { isArchived: true },
  });
}
