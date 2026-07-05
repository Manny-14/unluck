import { Router } from "express";
import {
  getHabitsHandler,
  createHabitHandler,
  updateHabitHandler,
  deleteHabitHandler
} from "../controllers/habitController";

const router = Router();

router.get("/", getHabitsHandler);
router.post("/", createHabitHandler);
router.put("/:id", updateHabitHandler);
router.delete("/:id", deleteHabitHandler);

export default router;
