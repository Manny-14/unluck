import { Router } from "express";
import { 
  getDashboardTasksHandler, 
  toggleTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler
} from "../controllers/taskController";

const router = Router();

router.get("/", getDashboardTasksHandler);
router.post("/", createTaskHandler);
router.post("/:id/toggle", toggleTaskHandler);
router.put("/:id", updateTaskHandler);
router.delete("/:id", deleteTaskHandler);

export default router;
