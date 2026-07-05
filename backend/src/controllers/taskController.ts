import { Request, Response } from "express";
import * as taskService from "../services/taskService";

/**
 * Parses the local date boundaries from the client and retrieves the customized
 * task list required for the main dashboard view.
 */
export async function getDashboardTasksHandler(req: Request, res: Response) {
  try {
    const { localDate, startOfDayUTC, endOfDayUTC } = req.query;

    if (!localDate || typeof localDate !== "string") {
      return res.status(400).json({ error: "Missing required query parameter: localDate (YYYY-MM-DD)" });
    }
    if (!startOfDayUTC || typeof startOfDayUTC !== "string") {
      return res.status(400).json({ error: "Missing required query parameter: startOfDayUTC (ISO String)" });
    }
    if (!endOfDayUTC || typeof endOfDayUTC !== "string") {
      return res.status(400).json({ error: "Missing required query parameter: endOfDayUTC (ISO String)" });
    }

    // @ts-ignore
    const userId = req.dbUser.id;
    
    const tasks = await taskService.getDashboardTasks(
      userId, 
      localDate, 
      new Date(startOfDayUTC), 
      new Date(endOfDayUTC)
    );
    
    return res.json(tasks);
  } catch (error: any) {
    console.error("Error fetching dashboard tasks:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Handles toggling the completion status of a generated task.
 */
export async function toggleTaskHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.dbUser.id;
    const result = await taskService.toggleTask(userId, id);
    return res.json(result);
  } catch (error: any) {
    console.error("Error toggling task:", error);
    if (error.message === "Task not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Handles creating a standalone, one-off task.
 */
export async function createTaskHandler(req: Request, res: Response) {
  try {
    // @ts-ignore
    const userId = req.dbUser.id;
    const data = req.body;
    
    if (!data.title) {
      return res.status(400).json({ error: "Task title is required." });
    }

    const newTask = await taskService.createTask(userId, data);
    return res.status(201).json(newTask);
  } catch (error: any) {
    console.error("Error creating task:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Handles updating a specific task instance (e.g. changing its time or location).
 */
export async function updateTaskHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.dbUser.id;
    const data = req.body;

    const updatedTask = await taskService.updateTask(userId, id, data);
    return res.json(updatedTask);
  } catch (error: any) {
    console.error("Error updating task:", error);
    if (error.message === "Task not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Handles deleting a specific task instance.
 */
export async function deleteTaskHandler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.dbUser.id;
    
    await taskService.deleteTask(userId, id);
    return res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting task:", error);
    if (error.message === "Task not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

