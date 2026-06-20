import { useState, useEffect } from "react";
import { CheckCircle2, Flame, Award, Compass, Sparkles, BookOpen, AlertCircle, RefreshCw } from "lucide-react";

interface HealthStatus {
  status: string;
  message: string;
  timestamp: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample habits & tasks to preview design
  const identities = [
    { name: "Focused Writer", votes: 12 },
    { name: "Consistent Athlete", votes: 24 },
    { name: "Lifelong Learner", votes: 8 }
  ];

  const sampleRules = [
    { need: "Run on the treadmill", want: "Watch my favorite Netflix show" },
    { need: "Do weekly planning", want: "Listen to new music releases" }
  ];

  const checkBackend = async () => {
    setLoading(true);
    setError(null);
    try {
      // Connect to backend (port 5001)
      const res = await fetch("http://localhost:5001/api/health");
      if (!res.ok) throw new Error("Backend response error");
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to local backend on port 5001. Ensure it is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  return (
    <div className="glass-container animate-fade-in" style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Unluck <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: "normal", letterSpacing: "0" }}>(Atomic Habits Hub)</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            "Every action you take is a vote for the type of person you wish to become."
          </p>
        </div>

        {/* Server Status Indicator */}
        <div 
          onClick={checkBackend}
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            padding: "0.5rem 1rem", 
            borderRadius: "20px", 
            background: "var(--card-bg)", 
            border: "1px solid var(--border-color)",
            cursor: "pointer"
          }}
        >
          {loading ? (
            <RefreshCw size={14} className="spin" style={{ animation: "spin 2s linear infinite" }} />
          ) : error ? (
            <AlertCircle size={14} color="coral" />
          ) : (
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }}></span>
          )}
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            {loading ? "Checking..." : error ? "Backend Offline" : `Backend Connected (${health ? "Online" : "Unknown"})`}
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        
        {/* Identity Cards (Casting Votes) */}
        <section className="glass-card glow-secondary" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Award color="var(--secondary)" size={24} />
            <h2>Your Identities</h2>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Cast votes for who you want to be. Each completed task or habit is a vote.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            {identities.map((identity) => (
              <div 
                key={identity.name} 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)"
                }}
              >
                <span style={{ fontWeight: 600 }}>{identity.name}</span>
                <span style={{ 
                  fontSize: "0.8rem", 
                  background: "var(--secondary-glow)", 
                  color: "var(--secondary)", 
                  padding: "0.25rem 0.6rem", 
                  borderRadius: "12px",
                  fontWeight: "bold"
                }}>
                  {identity.votes} Votes
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Untracked Temptation Bundles */}
        <section className="glass-card glow-primary" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Compass color="var(--primary)" size={24} />
            <h2>Temptation Playbook</h2>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Pair tasks you *need* to do with things you *want* to do. Untracked rules to avoid app fatigue.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            {sampleRules.map((rule, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9rem"
                }}
              >
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>
                  Rule #{idx + 1}
                </div>
                <div>
                  I will <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{rule.need}</span>
                </div>
                <div style={{ color: "var(--primary)", marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Sparkles size={12} /> while I {rule.want}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Habits Checklist Preview */}
        <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <BookOpen color="var(--accent)" size={24} />
              <h2>Daily Habits</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "orange", fontSize: "0.95rem", fontWeight: "bold" }}>
              <Flame size={16} /> 5 Day Streak
            </div>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Simple Yes/No tracking. Keeping consistency obvious and friction-free.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0" }}>
              <CheckCircle2 size={20} color="var(--primary)" />
              <div style={{ textDecoration: "line-through", color: "var(--text-muted)" }}>
                Read 10 pages <span style={{ fontSize: "0.75rem", display: "block", color: "var(--text-muted)" }}>Stack: After morning coffee</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0" }}>
              <span style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid var(--border-color)", display: "inline-block" }}></span>
              <div>
                Practice chords <span style={{ fontSize: "0.75rem", display: "block", color: "var(--text-secondary)" }}>Stack: After checking daily calendar</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{ marginTop: "4rem", textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Unluck App — Initial Local Setup. Connect your iOS app to Tailwind/Tailscale with API port 5001.
        </p>
      </footer>
    </div>
  );
}

export default App;
