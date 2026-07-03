import { Request, Response } from "express";
import * as habitService from "../services/habitService";

export async function getHabitsHandler(req: Request, res: Response) {
  try {
    const { date } = req.query;
    if (!date || typeof date !== "string") {
      return res.status(400).json({ error: "Missing required query parameter: date (YYYY-MM-DD)" });
    }

    // @ts-ignore
    const userId = req.dbUser.id;
    const data = await habitService.getDashboardData(userId, date);
    return res.json(data);
  } catch (error: any) {
    console.error("Error fetching habits:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function toggleHabitHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { date } = req.body;

    if (!date || typeof date !== "string") {
      return res.status(400).json({ error: "Missing required body parameter: date (YYYY-MM-DD)" });
    }

    // @ts-ignore
    const userId = req.dbUser.id;
    const result = await habitService.toggleHabit(userId, id, date);
    return res.json(result);
  } catch (error: any) {
    console.error("Error toggling habit:", error);
    if (error.message === "Habit not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}
