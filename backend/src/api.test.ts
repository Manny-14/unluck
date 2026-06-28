import request from "supertest";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Set environment variables for testing before importing modules
const testDbPath = path.join(__dirname, "../prisma/test.db");
process.env.DATABASE_URL = `file:${testDbPath}`;
process.env.NODE_ENV = "test";

import { app, prisma } from "./index";

describe("Habit Loop API Integration Tests", () => {
  const testDate = "2026-06-28";

  beforeAll(async () => {
    // Clean any old test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    // Push the schema to the test database
    execSync("npx prisma db push --skip-generate", {
      env: { ...process.env },
    });
  });

  afterAll(async () => {
    // Close connections and clean up
    await prisma.$disconnect();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test("GET /api/habits retrieves seeded list and initial state", async () => {
    const response = await request(app)
      .get("/api/habits")
      .query({ date: testDate });

    expect(response.status).toBe(200);
    expect(response.body.habits).toBeInstanceOf(Array);
    expect(response.body.habits.length).toBe(3); // Seeding should create 3 habits

    const practiceHabit = response.body.habits.find(
      (h: any) => h.title === "Practice guitar chords"
    );
    expect(practiceHabit).toBeDefined();
    expect(practiceHabit.isCompleted).toBe(false);
    expect(practiceHabit.currentStreak).toBe(0);
  });

  test("POST /api/habits/:id/toggle checks and unchecks a habit", async () => {
    // 1. Fetch habits to get an ID
    const habitsRes = await request(app)
      .get("/api/habits")
      .query({ date: testDate });
    const targetHabit = habitsRes.body.habits[0];

    // 2. Toggle to completed (check off)
    const toggleCheckRes = await request(app)
      .post(`/api/habits/${targetHabit.id}/toggle`)
      .send({ date: testDate });

    expect(toggleCheckRes.status).toBe(200);
    expect(toggleCheckRes.body.isCompleted).toBe(true);
    expect(toggleCheckRes.body.currentStreak).toBe(1);

    // 3. Toggle back to incomplete (uncheck)
    const toggleUncheckRes = await request(app)
      .post(`/api/habits/${targetHabit.id}/toggle`)
      .send({ date: testDate });

    expect(toggleUncheckRes.status).toBe(200);
    expect(toggleUncheckRes.body.isCompleted).toBe(false);
    expect(toggleUncheckRes.body.currentStreak).toBe(0);
  });
});
