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

// Mount API routes
app.use("/api", habitRouter);

if (process.env.NODE_ENV !== "test") {
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
  });
}

export { app, prisma };
