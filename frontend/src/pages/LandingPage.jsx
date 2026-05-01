import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: "80px 24px", textAlign: "center", maxWidth: 800, margin: "0 auto",
      }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, marginBottom: 16 }}>
          Customer Support,<br />Supercharged with AI
        </h1>
        <p style={{ fontSize: 18, color: "#737373", marginBottom: 32, maxWidth: 600, margin: "0 auto 32px" }}>
          Velox helps you resolve tickets faster with AI-powered classification,
          auto-replies, and smart routing - all in one beautiful dashboard.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link to="/register"><button className="btn btn-primary" style={{ padding: "12px 32px", fontSize: 16 }}>Get Started Free</button></Link>
          <Link to="/login"><button className="btn" style={{ padding: "12px 32px", fontSize: 16 }}>Sign In</button></Link>
        </div>
      </section>

      {/* Chat Preview */}
      <section style={{ maxWidth: 700, margin: "0 auto 80px", padding: "0 24px" }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            background: "#1a1a1a", color: "#fff", padding: "12px 20px",
            fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
          }}>
            ⚡ Velox Chat
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, minHeight: 200 }}>
            <div style={{ padding: "8px 14px", background: "#f5f5f5", borderRadius: 8, maxWidth: "75%", fontSize: 14 }}>
              Hi! I'm having trouble with my billing. I was charged twice this month.
            </div>
            <div style={{ padding: "8px 14px", background: "#1a1a1a", color: "#fff", borderRadius: 8, maxWidth: "75%", alignSelf: "flex-end", fontSize: 14 }}>
              I can see the duplicate charge on your account. I've initiated a refund - you'll see it within 3-5 business days. Is there anything else I can help with?
            </div>
            <div style={{ fontSize: 11, color: "#aaa", alignSelf: "flex-end" }}>
              ✨ AI auto-replied in 0.8s
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: 900, margin: "0 auto 80px", padding: "0 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 40 }}>
          Everything you need
        </h2>
        <div className="grid-3" style={{ gap: 24 }}>
          {[
            { icon: "🤖", title: "AI Auto-Reply", desc: "Resolve common questions instantly with FAQ-grounded AI responses." },
            { icon: "🎯", title: "Smart Routing", desc: "Automatically classify and route tickets to the right agent." },
            { icon: "📊", title: "Analytics", desc: "Track resolution times, agent performance, and customer satisfaction." },
            { icon: "💬", title: "Real-time Chat", desc: "Socket.IO powered live chat between agents and customers." },
            { icon: "🏢", title: "Multi-tenant", desc: "Each workspace is fully isolated - perfect for SaaS teams." },
            { icon: "🔌", title: "Widget SDK", desc: "Drop-in chat widget you can embed on any website." },
          ].map((f, i) => (
            <div key={i} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#737373" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #e5e5e5", padding: "24px", textAlign: "center",
        fontSize: 13, color: "#999",
      }}>
        &copy; {new Date().getFullYear()} Velox. Built with ⚡
      </footer>
    </div>
  );
}
