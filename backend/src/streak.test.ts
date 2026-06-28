import { calculateCurrentStreak } from "./streak";

describe("calculateCurrentStreak", () => {
  const today = "2026-06-28";

  test("should return 0 when there are no logs", () => {
    expect(calculateCurrentStreak([], today)).toBe(0);
  });

  test("should return 0 when no logs exist for today or yesterday", () => {
    const logs = [{ localDate: "2026-06-25" }];
    expect(calculateCurrentStreak(logs, today)).toBe(0);
  });

  test("should return 1 when habit is only completed today", () => {
    const logs = [{ localDate: "2026-06-28" }];
    expect(calculateCurrentStreak(logs, today)).toBe(1);
  });

  test("should return 1 when habit was completed yesterday but not today yet", () => {
    const logs = [{ localDate: "2026-06-27" }];
    expect(calculateCurrentStreak(logs, today)).toBe(1);
  });

  test("should calculate multiple consecutive days correctly starting today", () => {
    const logs = [
      { localDate: "2026-06-28" },
      { localDate: "2026-06-27" },
      { localDate: "2026-06-26" },
      { localDate: "2026-06-24" }, // Gap on the 25th
    ];
    expect(calculateCurrentStreak(logs, today)).toBe(3);
  });

  test("should calculate multiple consecutive days starting yesterday", () => {
    const logs = [
      { localDate: "2026-06-27" },
      { localDate: "2026-06-26" },
      { localDate: "2026-06-25" },
    ];
    expect(calculateCurrentStreak(logs, today)).toBe(3);
  });
});
