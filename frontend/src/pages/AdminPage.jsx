import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOverview, fetchTrends, fetchAgents } from "../store/analyticsSlice";
import { fetchUsers, fetchFAQs, fetchSettings } from "../store/adminSlice";
import { adminService } from "../services";
import Sidebar from "../components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminPage() {
  const dispatch = useDispatch();
  const { overview, trends, agentStats } = useSelector((s) => s.analytics);
  const { users, faqs, settings } = useSelector((s) => s.admin);
  const [activeTab, setActiveTab] = useState("overview");

  // New FAQ form
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "" });
  // Invite user form
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", password: "", role: "agent" });

  useEffect(() => {
    dispatch(fetchOverview({}));
    dispatch(fetchTrends({}));
    dispatch(fetchAgents({}));
    dispatch(fetchUsers());
    dispatch(fetchFAQs({}));
    dispatch(fetchSettings());
  }, [dispatch]);

  const handleCreateFAQ = async () => {
    if (!faqForm.question || !faqForm.answer) return;
    await adminService.createFAQ(faqForm);
    setFaqForm({ question: "", answer: "", category: "" });
    dispatch(fetchFAQs({}));
  };

  const handleDeleteFAQ = async (id) => {
    await adminService.deleteFAQ(id);
    dispatch(fetchFAQs({}));
  };

  const handleInviteUser = async () => {
    if (!inviteForm.name || !inviteForm.email || !inviteForm.password) return;
    await adminService.inviteUser(inviteForm);
    setInviteForm({ name: "", email: "", password: "", role: "agent" });
    dispatch(fetchUsers());
  };

  const tabs = ["overview", "team", "faqs", "settings"];

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <div className="app-topbar">
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Admin Panel</h1>
          <div style={{ display: "flex", gap: 8 }}>
            {tabs.map((tab) => (
              <button key={tab} className={`btn btn-sm ${activeTab === tab ? "btn-primary" : ""}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="app-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              {/* KPI Cards */}
              <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                  { label: "Total Tickets", value: overview?.total ?? "-" },
                  { label: "Open", value: overview?.open ?? "-" },
                  { label: "Avg Resolution", value: overview?.avgResolutionFormatted ?? "-" },
                  { label: "AI Resolution Rate", value: overview?.aiResolutionRate ? `${overview.aiResolutionRate}%` : "-" },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Trend Chart */}
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Ticket Volume Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#1a1a1a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Agents */}
              <div className="card">
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Top Agents</h3>
                <table className="table">
                  <thead>
                    <tr><th>Agent</th><th>Resolved</th><th>Total</th><th>Rate</th></tr>
                  </thead>
                  <tbody>
                    {agentStats.map((a, i) => (
                      <tr key={i}>
                        <td>{a.name}</td>
                        <td>{a.resolved}</td>
                        <td>{a.total}</td>
                        <td>{a.total ? ((a.resolved / a.total) * 100).toFixed(0) : 0}%</td>
                      </tr>
                    ))}
                    {!agentStats.length && <tr><td colSpan={4} style={{ textAlign: "center", color: "#999" }}>No data</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div>
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Invite Team Member</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input className="input" style={{ flex: 1 }} placeholder="Name" value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
                  <input className="input" style={{ flex: 1 }} placeholder="Email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
                  <input className="input" style={{ flex: 1 }} placeholder="Password" type="password" value={inviteForm.password} onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })} />
                  <select className="input" style={{ width: 120 }} value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}>
                    <option value="agent">Agent</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button className="btn btn-primary" onClick={handleInviteUser}>Invite</button>
                </div>
              </div>

              <div className="card">
                <table className="table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td><td>{u.email}</td><td className="badge">{u.role}</td>
                        <td><span className={`badge ${u.isActive ? "badge-open" : "badge-closed"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === "faqs" && (
            <div>
              <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Add FAQ</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input className="input" placeholder="Question" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} />
                  <textarea className="input" placeholder="Answer" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} rows={3} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="input" style={{ flex: 1 }} placeholder="Category (optional)" value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} />
                    <button className="btn btn-primary" onClick={handleCreateFAQ}>Add FAQ</button>
                  </div>
                </div>
              </div>

              <div className="card">
                {faqs.map((f) => (
                  <div key={f._id} style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{f.question}</div>
                      <div style={{ fontSize: 13, color: "#737373", marginTop: 4 }}>{f.answer}</div>
                    </div>
                    <button className="btn btn-sm" onClick={() => handleDeleteFAQ(f._id)} style={{ color: "#e53935", alignSelf: "flex-start" }}>Delete</button>
                  </div>
                ))}
                {!faqs.length && <div style={{ padding: 24, textAlign: "center", color: "#999" }}>No FAQs yet</div>}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Workspace Settings</h3>
              <div style={{ fontSize: 13, color: "#737373" }}>
                <p><strong>Name:</strong> {settings?.name || "-"}</p>
                <p><strong>Plan:</strong> {settings?.plan || "-"}</p>
                <p style={{ marginTop: 12, color: "#999" }}>AI, Widget, and Routing settings will be configurable here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
