import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "📋 Tickets" },
  { to: "/admin",     label: "⚙️ Admin" },
  { to: "/admin/faqs", label: "❓ FAQs" },
  { to: "/admin/users", label: "👥 Team" },
  { to: "/admin/analytics", label: "📊 Analytics" },
  { to: "/admin/settings", label: "🔧 Settings" },
];

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div style={{ padding: "0 16px 16px", fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>
        ⚡ VELOX
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            style={({ isActive }) => ({
              display: "block",
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              background: isActive ? "#f0f0f0" : "transparent",
              color: "#1a1a1a",
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
