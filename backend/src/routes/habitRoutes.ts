import { Router } from "express";
import {
  healthCheckHandler,
  getHabitsHandler,
  toggleHabitHandler,
} from "../controllers/habitController";

const router = Router();

router.get("/health", healthCheckHandler);
router.get("/habits", getHabitsHandler);
router.post("/habits/:id/toggle", toggleHabitHandler);

export default router;
