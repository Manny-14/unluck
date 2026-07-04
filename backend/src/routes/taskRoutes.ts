import { Router } from "express";
import { getDashboardTasksHandler, toggleTaskHandler } from "../controllers/taskController";

const router = Router();

router.get("/", getDashboardTasksHandler);
router.post("/:id/toggle", toggleTaskHandler);

export default router;
