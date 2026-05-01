/** Role, status, and priority constants */
export const ROLES = { ADMIN: "admin", AGENT: "agent", VIEWER: "viewer" };

export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

export const PRIORITY = { LOW: "low", MEDIUM: "medium", HIGH: "high", URGENT: "urgent" };

export const PRIORITY_COLORS = {
  low:    "#e3f2fd",
  medium: "#fff3e0",
  high:   "#fff8e1",
  urgent: "#ffebee",
};

export const STATUS_LABELS = {
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
  closed:      "Closed",
};
