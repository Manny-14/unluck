import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Unluck Backend API is running successfully.",
    timestamp: new Date().toISOString(),
  });
});

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
});
