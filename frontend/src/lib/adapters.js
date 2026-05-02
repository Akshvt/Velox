/**
 * Adapters that transform backend response shapes into the existing UI prop shapes
 * so we can swap mocks for real data without touching JSX.
 *
 * Backend ticket  (Ticket model): { _id, customer:{name,email}, subject, body,
 *   status: "open"|"in_progress"|"resolved"|"closed", priority, category,
 *   assignedTo, createdAt, lastMessageAt, ... }
 *
 * Backend message (Message model): { _id, senderType: "customer"|"agent"|"ai",
 *   senderId: { name } | null, content, createdAt }
 */

const STATUS_LABEL = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Resolved",
  pending: "Pending",
};

const STATUS_TONE = {
  Open: "#E9F5E0",
  Pending: "#FFF5DC",
  "In Progress": "#F1ECFF",
  Resolved: "#FCE7F3",
};

export function statusLabel(s) {
  return STATUS_LABEL[s] || "Open";
}

export function statusTone(label) {
  return STATUS_TONE[label] || "#E9F5E0";
}

export function initialsFor(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";
}

function shortTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function adaptTicket(t) {
  if (!t) return null;
  const customerName = t.customer?.name || "Customer";
  const label = statusLabel(t.status);
  return {
    raw: t,
    id: t._id,
    code: `TK-${String(t._id || "").slice(-4).toUpperCase()}`,
    initials: initialsFor(customerName),
    name: customerName,
    email: t.customer?.email || "",
    subject: t.subject || "Untitled",
    time: shortTime(t.lastMessageAt || t.createdAt),
    status: label,
    tone: statusTone(label),
    priority: (t.priority || "medium").replace(/^./, (c) => c.toUpperCase()),
    category: t.category || "",
    assignedTo: t.assignedTo || null,
    createdAt: t.createdAt,
  };
}

export function adaptMessage(m, currentUserId) {
  if (!m) return null;
  const isAgent = m.senderType === "agent";
  const isMine = isAgent && currentUserId && String(m.senderId?._id || m.senderId) === String(currentUserId);
  return {
    id: m._id,
    from:
      m.senderType === "customer" ? "customer" :
      m.senderType === "ai" ? "ai" :
      isMine ? "agent" : "agent",
    senderName: m.senderName || m.senderId?.name || (m.senderType === "ai" ? "AI" : m.senderType === "customer" ? "Customer" : "Agent"),
    text: m.content,
    time: shortTime(m.createdAt),
    isAi: m.senderType === "ai",
    raw: m,
  };
}
