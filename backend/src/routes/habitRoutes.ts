import { Router } from "express";
import {
  getHabitsHandler,
  toggleHabitHandler,
} from "../controllers/habitController";

const router = Router();

// Routes mapped to habit controller actions
router.get("/habits", getHabitsHandler);
router.post("/habits/:id/toggle", toggleHabitHandler);

export default router;
