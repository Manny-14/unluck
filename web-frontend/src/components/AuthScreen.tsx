import { SignIn } from "@clerk/react";
import { BookOpen } from "lucide-react";

export function AuthScreen() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }} className="glass-container animate-fade-in">
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <BookOpen color="var(--primary)" size={32} />
          <h1 style={{ 
            fontSize: "2.75rem", 
            fontFamily: "var(--font-serif)", 
            color: "var(--text-primary)",
            lineHeight: 1.1 
          }}>
            Unluck
          </h1>
        </div>
        <p style={{ 
          color: "var(--text-secondary)", 
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: "1.1rem"
        }}>
          Habits and systems to unluck your potential.
        </p>
      </div>

      <div className="wood-card" style={{ padding: '2rem', boxShadow: 'var(--shadow-elevated)' }}>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'btn btn-primary',
              card: 'shadow-none bg-transparent',
              headerTitle: 'text-primary font-serif',
              headerSubtitle: 'text-secondary',
            }
          }}
        />
      </div>
    </div>
  );
}
