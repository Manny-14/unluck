import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import habitRouter from "./routes/habitRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// API Infrastructure endpoint check
app.get("/api/health", (req, res) => {
  return res.json({
    status: "ok",
    message: "Unluck Backend API is running successfully.",
    timestamp: new Date().toISOString(),
  });
});

// Domain Routes
app.use("/api", habitRouter);

if (process.env.NODE_ENV !== "test") {
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
  });
}

export { app, prisma };
