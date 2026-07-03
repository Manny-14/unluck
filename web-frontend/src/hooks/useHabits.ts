import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";

export interface HealthStatus {
  status: string;
  message: string;
  timestamp: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  identityId: string | null;
  isCompleted: boolean;
  currentStreak: number;
}

export interface Identity {
  id: string;
  name: string;
  level: string;
  votes: number;
  accent: string;
}

/**
 * React hook encapsulating state updates, optimistic UI toggles, and backend syncing.
 */
export function useHabits() {
  const { getToken } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);

  /**
   * Helper function returning the client's current date formatted as YYYY-MM-DD.
   */
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /**
   * Loads habit checklist and identity votes from API.
   */
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const localDate = getLocalDateString();
      const token = await getToken();
      
      const res = await fetch(`http://localhost:5001/api/habits?date=${localDate}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Backend offline or Unauthorized");
      const data = await res.json();
      
      setHabits(data.habits);

      // Distribute cozy design accents to dynamic backend identities
      const accents = ["var(--primary)", "var(--secondary)", "var(--accent)"];
      const mappedIdentities = data.identities.map((id: any, index: number) => ({
        ...id,
        accent: accents[index % accents.length]
      }));
      setIdentities(mappedIdentities);

      setHealth({
        status: "ok",
        message: "Connected",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      setError("Unable to connect to local backend.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * Toggles habit completion, performs optimistic UI update, and resolves results on server callback.
   */
  const toggleHabit = async (habitId: string) => {
    const localDate = getLocalDateString();

    // 1. Optimistic UI update for snappy feedback
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const nextCompleted = !h.isCompleted;
          return {
            ...h,
            isCompleted: nextCompleted,
            currentStreak: nextCompleted
              ? h.currentStreak + 1
              : Math.max(0, h.currentStreak - 1)
          };
        }
        return h;
      })
    );

    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5001/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ date: localDate })
      });

      if (!res.ok) throw new Error("Toggle API failed");
      const result = await res.json(); // { habitId, isCompleted, currentStreak, identityId, identityVotes }

      // 2. Re-update with backend calculations
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id === habitId) {
            return {
              ...h,
              isCompleted: result.isCompleted,
              currentStreak: result.currentStreak
            };
          }
          return h;
        })
      );

      // Update identity votes in UI dynamically
      if (result.identityId) {
        setIdentities((prev) =>
          prev.map((id) => {
            if (id.id === result.identityId) {
              let level = "Novice";
              const v = result.identityVotes;
              if (v >= 10) level = "Expert";
              else if (v >= 5) level = "Amateur";
              else if (v >= 2) level = "Beginner";

              return {
                ...id,
                votes: v,
                level
              };
            }
            return id;
          })
        );
      }
    } catch (err) {
      console.error("Failed to toggle habit:", err);
      // Revert state from server to resolve discrepancies
      fetchDashboardData();
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Compute maximum streak from active habits
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.currentStreak), 0);

  return {
    health,
    loading,
    error,
    habits,
    identities,
    maxStreak,
    toggleHabit,
    fetchDashboardData
  };
}
