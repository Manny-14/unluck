import { Request, Response } from "express";
import * as habitService from "../services/habitService";

/**
 * Handles fetching all active habit blueprints for the authenticated user.
 */
export async function getHabitsHandler(req: Request, res: Response) {
  try {
    // @ts-ignore
    const userId = req.dbUser.id;
    const habits = await habitService.getHabits(userId);
    return res.json(habits);
  } catch (error: any) {
    console.error("Error fetching habits:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Handles the creation of a new habit blueprint.
 */
export async function createHabitHandler(req: Request, res: Response) {
  try {
    // @ts-ignore
    const userId = req.dbUser.id;
    const data = req.body;
    
    if (!data.title) {
      return res.status(400).json({ error: "Habit title is required." });
    }

    const newHabit = await habitService.createHabit(userId, data);
    return res.status(201).json(newHabit);
  } catch (error: any) {
    console.error("Error creating habit:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Handles updating an existing habit blueprint's fields (e.g. time, location).
 */
export async function updateHabitHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.dbUser.id;
    const data = req.body;

    const updatedHabit = await habitService.updateHabit(userId, id, data);
    return res.json(updatedHabit);
  } catch (error: any) {
    console.error("Error updating habit:", error);
    if (error.message === "Habit not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Handles archiving a habit so it stops generating daily tasks.
 */
export async function deleteHabitHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.dbUser.id;
    
    const archivedHabit = await habitService.archiveHabit(userId, id);
    return res.json(archivedHabit);
  } catch (error: any) {
    console.error("Error archiving habit:", error);
    if (error.message === "Habit not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}
