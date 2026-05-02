import { http, HttpResponse, delay } from "msw";
import { fixtures } from "./fixtures";

// Wildcard origin so MSW catches axios calls to http://localhost:5000/api/*
// as well as same-origin requests when VITE_API_URL is unset.
const API = "*/api";
const lag = () => delay(Math.floor(150 + Math.random() * 250));

// Mutable runtime copies so mutations persist within the session.
const db = JSON.parse(JSON.stringify(fixtures));

export const handlers = [
  /* ============ AUTH ============ */
  http.post(`${API}/auth/login`, async ({ request }) => {
    await lag();
    const { email, role } = await request.json();
    const user =
      db.users.find((u) => u.email === email) ||
      db.users.find((u) => u.role === role) ||
      db.users[0];
    return HttpResponse.json({ user, accessToken: "mock-token" });
  }),
  http.post(`${API}/auth/register`, async ({ request }) => {
    await lag();
    const body = await request.json();
    const user = {
      id: `u_${Date.now()}`,
      name: body.name || "New User",
      email: body.email,
      role: "admin",
      tenantId: `t_${Date.now()}`,
      initials: (body.name || body.email || "U")
        .split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
    };
    return HttpResponse.json({ success: true, user, accessToken: "mock-token" });
  }),
  http.post(`${API}/auth/logout`, async () => {
    await lag();
    return HttpResponse.json({ ok: true });
  }),
  http.get(`${API}/auth/me`, async () => {
    await lag();
    return HttpResponse.json(db.users[0]);
  }),
  http.post(`${API}/auth/refresh`, async () => {
    await lag();
    return HttpResponse.json({ accessToken: "mock-token-refreshed" });
  }),

  /* ============ TICKETS ============ */
  http.get(`${API}/tickets`, async ({ request }) => {
    await lag();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const q = (url.searchParams.get("q") || "").toLowerCase();
    let list = db.tickets;
    if (status) list = list.filter((t) => t.status === status);
    if (q)
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.customer.name.toLowerCase().includes(q),
      );
    return HttpResponse.json(list);
  }),
  http.get(`${API}/tickets/stats`, async () => {
    await lag();
    return HttpResponse.json(db.ticketStats);
  }),
  http.get(`${API}/tickets/:id`, async ({ params }) => {
    await lag();
    const t = db.tickets.find((x) => x.id === params.id);
    return t
      ? HttpResponse.json(t)
      : HttpResponse.json({ message: "Not found" }, { status: 404 });
  }),
  http.post(`${API}/tickets`, async ({ request }) => {
    await lag();
    const body = await request.json();
    const ticket = {
      id: `TK-${Math.floor(2600 + Math.random() * 999)}`,
      status: "Open",
      priority: "Medium",
      channel: "Web",
      assignedTo: null,
      createdAt: Date.now(),
      ...body,
    };
    db.tickets.unshift(ticket);
    return HttpResponse.json(ticket, { status: 201 });
  }),
  http.patch(`${API}/tickets/:id`, async ({ params, request }) => {
    await lag();
    const body = await request.json();
    const idx = db.tickets.findIndex((t) => t.id === params.id);
    if (idx < 0) return HttpResponse.json({}, { status: 404 });
    db.tickets[idx] = { ...db.tickets[idx], ...body };
    return HttpResponse.json(db.tickets[idx]);
  }),
  http.post(`${API}/tickets/:id/assign`, async ({ params, request }) => {
    await lag();
    const { agentId } = await request.json();
    const idx = db.tickets.findIndex((t) => t.id === params.id);
    if (idx < 0) return HttpResponse.json({}, { status: 404 });
    db.tickets[idx].assignedTo = agentId;
    return HttpResponse.json(db.tickets[idx]);
  }),
  http.post(`${API}/tickets/:id/resolve`, async ({ params }) => {
    await lag();
    const idx = db.tickets.findIndex((t) => t.id === params.id);
    if (idx < 0) return HttpResponse.json({}, { status: 404 });
    db.tickets[idx].status = "Resolved";
    return HttpResponse.json(db.tickets[idx]);
  }),

  /* ============ CHAT ============ */
  http.get(`${API}/chat/:id/messages`, async ({ params }) => {
    await lag();
    return HttpResponse.json(db.conversations[params.id] || []);
  }),
  http.post(`${API}/chat/:id/messages`, async ({ params, request }) => {
    await lag();
    const body = await request.json();
    const list = (db.conversations[params.id] ||= []);
    const msg = {
      id: list.length + 1,
      from: body.from || "agent",
      text: body.text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    list.push(msg);
    return HttpResponse.json(msg, { status: 201 });
  }),
  http.post(`${API}/chat/sessions`, async ({ request }) => {
    await lag();
    const body = await request.json();
    return HttpResponse.json({ id: `cs_${Date.now()}`, ...body }, { status: 201 });
  }),
  http.post(`${API}/chat/sessions/:id/escalate`, async ({ request }) => {
    await lag();
    const body = await request.json();
    const ticket = {
      id: `TK-${Math.floor(2600 + Math.random() * 999)}`,
      customer: { name: body.name || "Guest Customer", initials: "GC" },
      subject: body.subject || "Escalated from AI chat",
      preview: body.preview || "",
      status: "Open",
      priority: "High",
      channel: "Chat",
      assignedTo: null,
      createdAt: Date.now(),
    };
    db.tickets.unshift(ticket);
    return HttpResponse.json({ ticket }, { status: 201 });
  }),
  http.post(`${API}/chat/ai/suggest`, async ({ request }) => {
    await lag();
    const { text } = await request.json();
    return HttpResponse.json({
      suggestions: [
        `Try checking your account settings related to "${text?.slice(0, 24) || "this"}".`,
        "Here is a relevant article from our knowledge base.",
        "Would you like me to escalate this to a human agent?",
      ],
      confidence: 0.86,
    });
  }),

  /* ============ AGENTS ============ */
  http.get(`${API}/agents`, async () => {
    await lag();
    return HttpResponse.json(db.agents);
  }),
  http.get(`${API}/agents/:id`, async ({ params }) => {
    await lag();
    const a = db.agents.find((x) => x.id === params.id);
    return a ? HttpResponse.json(a) : HttpResponse.json({}, { status: 404 });
  }),
  http.post(`${API}/agents/invite`, async ({ request }) => {
    await lag();
    const body = await request.json();
    const a = {
      id: `u_${Date.now().toString(36)}`,
      role: "agent",
      status: "offline",
      openTickets: 0,
      csat: null,
      initials: (body.name || "NA").slice(0, 2).toUpperCase(),
      ...body,
    };
    db.agents.push(a);
    return HttpResponse.json(a, { status: 201 });
  }),
  http.patch(`${API}/agents/:id`, async ({ params, request }) => {
    await lag();
    const body = await request.json();
    const idx = db.agents.findIndex((a) => a.id === params.id);
    if (idx < 0) return HttpResponse.json({}, { status: 404 });
    db.agents[idx] = { ...db.agents[idx], ...body };
    return HttpResponse.json(db.agents[idx]);
  }),
  http.delete(`${API}/agents/:id`, async ({ params }) => {
    await lag();
    db.agents = db.agents.filter((a) => a.id !== params.id);
    return HttpResponse.json({ ok: true });
  }),

  /* ============ KB ============ */
  http.get(`${API}/kb/articles`, async ({ request }) => {
    await lag();
    const q = (new URL(request.url).searchParams.get("q") || "").toLowerCase();
    const list = q
      ? db.kbArticles.filter((a) => a.title.toLowerCase().includes(q))
      : db.kbArticles;
    return HttpResponse.json(list);
  }),
  http.get(`${API}/kb/articles/:id`, async ({ params }) => {
    await lag();
    const a = db.kbArticles.find((x) => x.id === params.id);
    return a ? HttpResponse.json(a) : HttpResponse.json({}, { status: 404 });
  }),
  http.get(`${API}/kb/categories`, async () => {
    await lag();
    return HttpResponse.json(db.kbCategories);
  }),
  http.get(`${API}/kb/search`, async ({ request }) => {
    await lag();
    const q = (new URL(request.url).searchParams.get("q") || "").toLowerCase();
    return HttpResponse.json(
      db.kbArticles.filter((a) => a.title.toLowerCase().includes(q)),
    );
  }),

  /* ============ FAQ ============ */
  http.get(`${API}/faq`, async () => {
    await lag();
    return HttpResponse.json(db.faq);
  }),
  http.post(`${API}/faq`, async ({ request }) => {
    await lag();
    const body = await request.json();
    const item = { id: `f_${Date.now().toString(36)}`, ...body };
    db.faq.push(item);
    return HttpResponse.json(item, { status: 201 });
  }),
  http.patch(`${API}/faq/:id`, async ({ params, request }) => {
    await lag();
    const body = await request.json();
    const idx = db.faq.findIndex((f) => f.id === params.id);
    if (idx < 0) return HttpResponse.json({}, { status: 404 });
    db.faq[idx] = { ...db.faq[idx], ...body };
    return HttpResponse.json(db.faq[idx]);
  }),
  http.delete(`${API}/faq/:id`, async ({ params }) => {
    await lag();
    db.faq = db.faq.filter((f) => f.id !== params.id);
    return HttpResponse.json({ ok: true });
  }),

  /* ============ ANALYTICS ============ */
  http.get(`${API}/analytics/overview`, async () => {
    await lag();
    return HttpResponse.json(db.analytics.overview);
  }),
  http.get(`${API}/analytics/tickets-trend`, async () => {
    await lag();
    return HttpResponse.json(db.analytics.ticketsTrend);
  }),
  http.get(`${API}/analytics/agent-performance`, async () => {
    await lag();
    return HttpResponse.json(db.analytics.agentPerformance);
  }),
  http.get(`${API}/analytics/csat`, async () => {
    await lag();
    return HttpResponse.json(db.analytics.csat);
  }),
  http.get(`${API}/analytics/channels`, async () => {
    await lag();
    return HttpResponse.json(db.analytics.channels);
  }),
  http.get(`${API}/analytics/ai-deflection`, async () => {
    await lag();
    return HttpResponse.json(db.analytics.aiDeflection);
  }),

  /* ============ REPORTS ============ */
  http.get(`${API}/reports`, async () => {
    await lag();
    return HttpResponse.json(db.reports);
  }),
  http.post(`${API}/reports`, async ({ request }) => {
    await lag();
    const body = await request.json();
    const r = { id: `r_${Date.now().toString(36)}`, lastRun: null, ...body };
    db.reports.push(r);
    return HttpResponse.json(r, { status: 201 });
  }),
  http.delete(`${API}/reports/:id`, async ({ params }) => {
    await lag();
    db.reports = db.reports.filter((r) => r.id !== params.id);
    return HttpResponse.json({ ok: true });
  }),
  http.get(`${API}/reports/:id/export`, async () => {
    await lag();
    return HttpResponse.json({ url: "/mock-export.csv" });
  }),

  /* ============ SETTINGS ============ */
  http.get(`${API}/settings/workspace`, async () => {
    await lag();
    return HttpResponse.json(db.settings.workspace);
  }),
  http.patch(`${API}/settings/workspace`, async ({ request }) => {
    await lag();
    const body = await request.json();
    db.settings.workspace = { ...db.settings.workspace, ...body };
    return HttpResponse.json(db.settings.workspace);
  }),
  http.get(`${API}/settings/profile`, async () => {
    await lag();
    return HttpResponse.json(db.settings.profile);
  }),
  http.patch(`${API}/settings/profile`, async ({ request }) => {
    await lag();
    const body = await request.json();
    db.settings.profile = { ...db.settings.profile, ...body };
    return HttpResponse.json(db.settings.profile);
  }),
  http.get(`${API}/settings/notifications`, async () => {
    await lag();
    return HttpResponse.json(db.settings.notifications);
  }),
  http.patch(`${API}/settings/notifications`, async ({ request }) => {
    await lag();
    const body = await request.json();
    db.settings.notifications = { ...db.settings.notifications, ...body };
    return HttpResponse.json(db.settings.notifications);
  }),
  http.get(`${API}/settings/security`, async () => {
    await lag();
    return HttpResponse.json(db.settings.security);
  }),
];
