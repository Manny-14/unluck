import { CheckCircle2, Flame, Award, Compass, Sparkles, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { useHabits } from "./hooks/useHabits";

function App() {
  const {
    health,
    loading,
    error,
    habits,
    identities,
    maxStreak,
    toggleHabit,
    fetchDashboardData
  } = useHabits();

  // Simple static rules for temptation bundling (untracked)
  const sampleRules = [
    { need: "Practice guitar chords", want: "Watch my favorite TV series" },
    { need: "Write 500 words", want: "Listen to new music releases" }
  ];

  return (
    <div className="glass-container animate-fade-in" style={{ maxWidth: "1000px" }}>
      
      {/* Header Desk-Plate Style */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        marginBottom: "3rem",
        paddingBottom: "1.5rem",
        borderBottom: "2px solid var(--border-color)"
      }}>
        <div>
          <h1 style={{ 
            fontSize: "2.75rem", 
            fontFamily: "var(--font-serif)", 
            color: "var(--text-primary)",
            lineHeight: 1.1 
          }}>
            Unluck
          </h1>
          <p style={{ 
            color: "var(--text-secondary)", 
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "1.1rem",
            marginTop: "0.5rem"
          }}>
            “Every action you take is a vote for the type of person you wish to become.”
          </p>
        </div>

        {/* Server Status Badge */}
        <button 
          onClick={fetchDashboardData}
          className="btn btn-secondary"
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            borderRadius: "var(--radius-sm)", 
            padding: "0.5rem 0.75rem",
            fontSize: "0.8rem"
          }}
        >
          {loading ? (
            <RefreshCw size={12} className="spin" style={{ animation: "spin 2s linear infinite" }} />
          ) : error ? (
            <AlertCircle size={12} color="coral" />
          ) : (
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)" }}></span>
          )}
          <span style={{ fontWeight: 600 }}>
            {loading ? "Loading..." : error ? "Server Offline" : `Server Connected (${health ? "Online" : "Unknown"})`}
          </span>
        </button>
      </header>

      {/* Main Grid: Structural wood dividers and bevel blocks */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.75rem" }}>
        
        {/* Identities Card (Passport Style) */}
        <section className="wood-card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Award color="var(--secondary)" size={22} />
            <h2>My Identities</h2>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
            Reinforce your core beliefs. Track lifetime votes and level accomplishments.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {identities.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "1rem" }}>
                No identities loaded.
              </div>
            ) : (
              identities.map((identity) => {
                // Compute visual momentum progress bar based on votes (capped at 100%)
                const momentumPercent = Math.min(100, Math.round((identity.votes / 10) * 100));

                return (
                  <div 
                    key={identity.id} 
                    style={{ 
                      display: "flex", 
                      flexDirection: "column",
                      gap: "0.5rem",
                      padding: "1rem",
                      background: "var(--card-bg-hover)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-sm)",
                      boxShadow: "var(--shadow-inset)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{identity.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                          Level: {identity.level}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: "0.8rem", 
                        background: "var(--bg-color)", 
                        color: "var(--text-primary)", 
                        padding: "0.25rem 0.5rem", 
                        borderRadius: "4px",
                        fontWeight: 700,
                        border: "1px solid var(--border-color)"
                      }}>
                        {identity.votes} Votes
                      </div>
                    </div>
                    
                    {/* Momentum Progress Bar */}
                    <div style={{ marginTop: "0.25rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        <span>Progress to Mastery</span>
                        <span style={{ fontWeight: 700, color: identity.accent }}>{momentumPercent}%</span>
                      </div>
                      <div style={{ 
                        height: "6px", 
                        background: "var(--bg-color)", 
                        borderRadius: "3px", 
                        overflow: "hidden", 
                        marginTop: "0.25rem",
                        border: "1px solid var(--border-color)"
                      }}>
                        <div style={{ 
                          width: `${momentumPercent}%`, 
                          height: "100%", 
                          background: identity.accent,
                          borderRadius: "3px",
                          transition: "width 0.35s ease-out"
                        }}></div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Temptation Playbook Card (Earthy Inset styling) */}
        <section className="wood-card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Compass color="var(--primary)" size={22} />
            <h2>Temptation Rules</h2>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
            Pair tasks you need to perform with things you want to enjoy. Untracked to minimize friction.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {sampleRules.map((rule, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: "1rem",
                  background: "var(--card-bg-hover)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--shadow-inset)"
                }}
              >
                <div style={{ 
                  color: "var(--accent)", 
                  fontSize: "0.7rem", 
                  letterSpacing: "1px",
                  textTransform: "uppercase", 
                  fontWeight: 700, 
                  marginBottom: "0.35rem" 
                }}>
                  Rule #{idx + 1}
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  I will <span style={{ color: "var(--text-primary)" }}>{rule.need}</span>
                </div>
                <div style={{ 
                  color: "var(--primary)", 
                  marginTop: "0.35rem", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.35rem",
                  fontSize: "0.88rem",
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic"
                }}>
                  <Sparkles size={12} /> while I {rule.want}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Habits Checklist Card */}
        <section className="wood-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <BookOpen color="var(--accent)" size={22} />
              <h2>Daily Habits</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--accent)", fontSize: "0.88rem", fontWeight: 700 }}>
              <Flame size={14} /> {maxStreak} Day Streak
            </div>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
            Simple binary checkboxes. Stacked directly on top of existing daily routines.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {habits.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "1rem" }}>
                No habits loaded.
              </div>
            ) : (
              habits.map((habit) => (
                <div 
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.75rem", 
                    padding: "0.75rem 1rem",
                    background: habit.isCompleted ? "var(--card-bg-hover)" : "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-sm)",
                    boxShadow: habit.isCompleted ? "var(--shadow-inset)" : "0 1px 2px rgba(44,37,35,0.03)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {habit.isCompleted ? (
                    <CheckCircle2 size={18} color="var(--primary)" />
                  ) : (
                    <span style={{ 
                      width: "18px", 
                      height: "18px", 
                      borderRadius: "50%", 
                      border: "2.5px solid var(--border-color)", 
                      display: "inline-block",
                      flexShrink: 0
                    }}></span>
                  )}
                  <div style={{ 
                    textDecoration: habit.isCompleted ? "line-through" : "none", 
                    color: habit.isCompleted ? "var(--text-muted)" : "var(--text-primary)", 
                    fontSize: "0.95rem",
                    fontWeight: habit.isCompleted ? 500 : 600
                  }}>
                    {habit.title}
                    {habit.description && (
                      <span style={{ 
                        fontSize: "0.75rem", 
                        display: "block", 
                        color: habit.isCompleted ? "var(--text-muted)" : "var(--text-secondary)", 
                        fontWeight: 500 
                      }}>
                        {habit.description}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Footer Desk Plate */}
      <footer style={{ 
        marginTop: "4.5rem", 
        textAlign: "center", 
        borderTop: "2px solid var(--border-color)", 
        paddingTop: "1.5rem" 
      }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.5px" }}>
          Unluck — Visual Design: Cozy Wood-Framed Desktop Accessory theme. Co-developing with iOS client.
        </p>
      </footer>
    </div>
  );
}

export default App;
