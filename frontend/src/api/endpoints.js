/**
 * Barrel export for all domain services.
 * Each service is a thin axios wrapper that returns unwrapped data and is
 * mapped to the backend routes documented in each service file.
 *
 * Backend reference: backend/src/routes/*.routes.js
 */
export { auth } from "./services/auth.service";
export { tickets } from "./services/tickets.service";
export { chat } from "./services/chat.service";
export { agents } from "./services/agents.service";
export { kb } from "./services/kb.service";
export { faq } from "./services/faq.service";
export { analytics } from "./services/analytics.service";
export { reports } from "./services/reports.service";
export { settings } from "./services/settings.service";
export { admin } from "./services/admin.service";
export { ai } from "./services/ai.service";
export { widget } from "./services/widget.service";

// Convenience grouped namespace
import { auth } from "./services/auth.service";
import { tickets } from "./services/tickets.service";
import { chat } from "./services/chat.service";
import { agents } from "./services/agents.service";
import { kb } from "./services/kb.service";
import { faq } from "./services/faq.service";
import { analytics } from "./services/analytics.service";
import { reports } from "./services/reports.service";
import { settings } from "./services/settings.service";
import { admin } from "./services/admin.service";
import { ai } from "./services/ai.service";
import { widget } from "./services/widget.service";

export const endpoints = {
  auth,
  tickets,
  chat,
  agents,
  kb,
  faq,
  analytics,
  reports,
  settings,
  admin,
  ai,
  widget,
};
