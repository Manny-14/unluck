import { Router } from "express";
import { getIdentitiesHandler } from "../controllers/identityController";

const router = Router();

router.get("/", getIdentitiesHandler);

export default router;
