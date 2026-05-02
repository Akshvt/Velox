// Static fixtures used by MSW handlers. Mirrors the agreed backend contract.
// Replace with real API by switching off MSW (set VITE_USE_MOCK=false).

export const fixtures = {
  users: [
    {
      id: "u_admin",
      email: "admin@velox.io",
      role: "admin",
      name: "Admin User",
      initials: "AU",
      roleLabel: "Super Admin",
    },
    {
      id: "u_alex",
      email: "alex@velox.io",
      role: "agent",
      name: "Alex Johnson",
      initials: "AJ",
      roleLabel: "Support Agent",
    },
  ],

  tickets: [
    { id: "TK-2505", customer: { name: "John Doe", initials: "JD" }, subject: "Order status inquiry", preview: "Hello! I need help with my order.", status: "Open", priority: "High", channel: "Chat", assignedTo: "u_alex", createdAt: Date.now() - 1000 * 60 * 25 },
    { id: "TK-2504", customer: { name: "Sarah Smith", initials: "SS" }, subject: "Refund not received", preview: "I have not received my refund yet.", status: "Pending", priority: "Medium", channel: "Email", assignedTo: "u_alex", createdAt: Date.now() - 1000 * 60 * 60 * 2 },
    { id: "TK-2503", customer: { name: "Mike Johnson", initials: "MJ" }, subject: "Unable to login", preview: "Login fails with 500.", status: "In Progress", priority: "High", channel: "Chat", assignedTo: "u_alex", createdAt: Date.now() - 1000 * 60 * 60 * 26 },
    { id: "TK-2502", customer: { name: "Emma Williams", initials: "EW" }, subject: "Product not working", preview: "My device shuts off randomly.", status: "Open", priority: "Low", channel: "Web", assignedTo: null, createdAt: Date.now() - 1000 * 60 * 60 * 30 },
    { id: "TK-2501", customer: { name: "David Brown", initials: "DB" }, subject: "Payment issue", preview: "Card declined twice.", status: "Resolved", priority: "Medium", channel: "Email", assignedTo: "u_alex", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
  ],

  ticketStats: { open: 8, pending: 2, resolved: 12, avgResponse: "2h 45m" },

  conversations: {
    "TK-2505": [
      { id: 1, from: "customer", text: "Hello! I need help with my order.", time: "10:28 AM" },
      { id: 2, from: "agent", text: "Sure! Can you share your order ID?", time: "10:29 AM" },
      { id: 3, from: "customer", text: "Yes, my order ID is #12345.", time: "10:30 AM" },
      { id: 4, from: "agent", text: "Thank you! Let me check the status.", time: "10:31 AM" },
    ],
  },

  agents: [
    { id: "u_alex", name: "Alex Johnson", email: "alex@velox.io", role: "agent", status: "online", openTickets: 8, csat: 4.8, initials: "AJ" },
    { id: "u_priya", name: "Priya Patel", email: "priya@velox.io", role: "agent", status: "online", openTickets: 5, csat: 4.9, initials: "PP" },
    { id: "u_sam", name: "Sam Lee", email: "sam@velox.io", role: "agent", status: "away", openTickets: 3, csat: 4.6, initials: "SL" },
    { id: "u_admin", name: "Admin User", email: "admin@velox.io", role: "admin", status: "online", openTickets: 0, csat: null, initials: "AU" },
  ],

  kbArticles: [
    { id: "kb_1", title: "How to reset your password", category: "Account", views: 1240, updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3, body: "Step-by-step…" },
    { id: "kb_2", title: "Refund policy", category: "Billing", views: 980, updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 7, body: "We refund within 30 days…" },
    { id: "kb_3", title: "Tracking your order", category: "Orders", views: 2150, updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1, body: "Use the tracking link…" },
  ],

  kbCategories: [
    { id: "c_acc", label: "Account", count: 12 },
    { id: "c_bill", label: "Billing", count: 8 },
    { id: "c_ord", label: "Orders", count: 14 },
    { id: "c_tech", label: "Technical", count: 19 },
  ],

  faq: [
    { id: "f_1", q: "How do I cancel my subscription?", a: "From Settings → Billing.", category: "Billing" },
    { id: "f_2", q: "Can I change my plan?", a: "Yes, anytime via Settings.", category: "Billing" },
    { id: "f_3", q: "Where is my order?", a: "Track it from your dashboard.", category: "Orders" },
  ],

  analytics: {
    overview: {
      totalTickets: { value: 1284, deltaPct: 12.4, trend: "up" },
      avgResponse: { value: "2h 45m", deltaPct: -8.2, trend: "down" },
      csat: { value: 4.8, deltaPct: 2.1, trend: "up" },
      aiDeflection: { value: "62%", deltaPct: 4.5, trend: "up" },
    },
    ticketsTrend: [
      { d: "Mon", value: 32 }, { d: "Tue", value: 45 }, { d: "Wed", value: 38 },
      { d: "Thu", value: 52 }, { d: "Fri", value: 41 }, { d: "Sat", value: 28 }, { d: "Sun", value: 22 },
    ],
    agentPerformance: [
      { agentId: "u_alex", name: "Alex Johnson", resolved: 84, csat: 4.8, avgResponse: "2m" },
      { agentId: "u_priya", name: "Priya Patel", resolved: 92, csat: 4.9, avgResponse: "1m" },
      { agentId: "u_sam", name: "Sam Lee", resolved: 61, csat: 4.6, avgResponse: "3m" },
    ],
    channels: [
      { channel: "Chat", value: 540 }, { channel: "Email", value: 320 },
      { channel: "Web", value: 280 }, { channel: "API", value: 144 },
    ],
    csat: { score: 4.8, total: 1284, breakdown: { 5: 820, 4: 312, 3: 98, 2: 35, 1: 19 } },
    aiDeflection: { resolvedByAi: 796, escalated: 488, deflectionRate: 0.62 },
  },

  reports: [
    { id: "r_1", name: "Weekly Tickets", schedule: "weekly", lastRun: Date.now() - 1000 * 60 * 60 * 24 * 2, format: "csv" },
    { id: "r_2", name: "CSAT by Agent", schedule: "monthly", lastRun: Date.now() - 1000 * 60 * 60 * 24 * 6, format: "pdf" },
  ],

  settings: {
    workspace: { name: "Acme Inc.", domain: "acme.velox.io", timezone: "America/Los_Angeles", language: "en" },
    profile: { name: "Alex Johnson", email: "alex@velox.io", phone: "+1 555 0100", avatar: null },
    notifications: { email: true, push: true, sms: false, mentions: true, dailyDigest: true },
    security: { mfaEnabled: false, lastPasswordChange: Date.now() - 1000 * 60 * 60 * 24 * 60 },
  },
};
