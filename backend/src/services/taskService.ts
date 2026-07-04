import { prisma } from "../prisma";
import { parseISO, getDay } from "date-fns";

/**
 * Checks a user's active habits against the provided day of the week and lazily 
 * generates missing Task records for that specific date in the database.
 */
export async function generateLazyTasks(userId: string, localDateStr: string, startOfDayUTC: Date, endOfDayUTC: Date) {
  // 1. Get all active habits for the user
  const habits = await prisma.habit.findMany({
    where: { userId, isArchived: false },
  });

  // 2. Determine day of week (0 = Sunday, 6 = Saturday)
  const localDate = parseISO(localDateStr);
  const dayOfWeek = getDay(localDate).toString();

  const generatedTasks = [];

  // 3. For each habit, check if it should recur today
  for (const habit of habits) {
    const recurrenceDays = habit.recurrenceDays.split(",");
    
    if (recurrenceDays.includes(dayOfWeek)) {
      // Check if a task already exists for this habit today
      const existingTask = await prisma.task.findFirst({
        where: {
          habitId: habit.id,
          dueDate: {
            gte: startOfDayUTC,
            lte: endOfDayUTC,
          },
        },
      });

      if (!existingTask) {
        // Generate it
        const newTask = await prisma.task.create({
          data: {
            title: habit.title,
            note: habit.description,
            userId: userId,
            identityId: habit.identityId,
            habitId: habit.id,
            timeOfDay: habit.timeOfDay,
            location: habit.location,
            temptationWant: habit.temptationWant,
            // Deadline is end of day
            dueDate: endOfDayUTC,
          },
        });
        generatedTasks.push(newTask);
      }
    }
  }

  return generatedTasks;
}

/**
 * Retrieves the curated list of tasks needed for the main dashboard view. 
 * This triggers lazy generation for the requested date and filters out stale tasks.
 */
export async function getDashboardTasks(userId: string, localDateStr: string, startOfDayUTC: Date, endOfDayUTC: Date) {
  // Lazily generate any missing tasks for today
  await generateLazyTasks(userId, localDateStr, startOfDayUTC, endOfDayUTC);

  // Return all tasks for the user that are either:
  // 1. Incomplete and dueDate >= (7 days ago) to filter out stale tasks.
  // 2. Completed today (or within the requested date range).
  
  // For the dashboard, we usually want to see:
  // - All uncompleted tasks (that aren't stale)
  // - Tasks completed *today*
  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        {
          completedAt: null,
          habitId: null, // Only standard tasks roll over; habit tasks do not roll over if missed
          dueDate: { 
            gte: sevenDaysAgo,
            lte: endOfDayUTC
          },
        },
        {
          completedAt: {
            gte: startOfDayUTC,
            lte: endOfDayUTC,
          }
        },
        {
          dueDate: {
            gte: startOfDayUTC,
            lte: endOfDayUTC,
          }
        }
      ]
    },
    include: { habit: true }
  });

  // Sort tasks to place incomplete items first, then order by time, and alphabetize ties.
  return tasks.sort((a, b) => {
    // 1. Incomplete tasks at the top, completed at the bottom
    if (a.completedAt && !b.completedAt) return 1;
    if (!a.completedAt && b.completedAt) return -1;
    
    // 2. Sort by time of day chronologically (e.g., 08:00 AM before 01:00 PM)
    if (a.timeOfDay && b.timeOfDay) return a.timeOfDay.localeCompare(b.timeOfDay);
    
    // 3. Timed tasks go above untimed tasks
    if (a.timeOfDay) return -1;
    if (b.timeOfDay) return 1;
    
    // 4. Alphabetical tie-breaker
    return a.title.localeCompare(b.title);
  });
}

/**
 * Toggles a specific task's completion status by setting or clearing its completedAt timestamp.
 */
export async function toggleTask(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task || task.userId !== userId) {
    throw new Error("Task not found");
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      completedAt: task.completedAt ? null : new Date()
    }
  });

  return updatedTask;
}

