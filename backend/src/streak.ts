import { parseISO, subDays, format } from "date-fns";

/**
 * Calculates the current consecutive daily streak for a habit.
 * 
 * @param logs Array of logs containing the localDate strings ("YYYY-MM-DD")
 * @param userTodayStr The user's current local date string ("YYYY-MM-DD")
 * @returns The number of consecutive days completed
 */
export function calculateCurrentStreak(logs: { localDate: string }[], userTodayStr: string): number {
  if (logs.length === 0) return 0;

  // Use a Set of localDate strings for O(1) checks
  const loggedDates = new Set(logs.map(log => log.localDate));

  const todayDate = parseISO(userTodayStr);
  const todayStr = format(todayDate, "yyyy-MM-dd");
  const yesterdayStr = format(subDays(todayDate, 1), "yyyy-MM-dd");

  let cursorStr = "";
  if (loggedDates.has(todayStr)) {
    cursorStr = todayStr;
  } else if (loggedDates.has(yesterdayStr)) {
    cursorStr = yesterdayStr;
  } else {
    // If not completed today or yesterday, the streak is broken (0)
    return 0;
  }

  let streak = 0;
  let cursorDate = parseISO(cursorStr);

  while (true) {
    const targetDateStr = format(cursorDate, "yyyy-MM-dd");
    if (loggedDates.has(targetDateStr)) {
      streak++;
      cursorDate = subDays(cursorDate, 1);
    } else {
      break;
    }
  }

  return streak;
}
