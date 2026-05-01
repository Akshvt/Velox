# Velox -- Team TODO Lists

> Ordered by dependency. Do not skip ahead. Each phase unlocks the next.

---

## Folder Structures

### Backend

```
backend/
    src/
        config/
            db.js               MongoDB connection with retry logic
            redis.js            ioredis client setup
            env.js              dotenv loader -- fails fast if vars missing
        middleware/
            auth.js             Verifies JWT, attaches req.user
            rbac.js             requireRole('admin') -- checks req.user.role
            tenant.js           Extracts tenantId from JWT, attaches req.tenant
            rateLimiter.js      Redis-backed sliding window rate limiter
            security.js         Helmet + CORS + mongo-sanitize + xss + hpp
            validate.js         Joi/Zod schema validation per route
            errorHandler.js     Global error handler -- consistent JSON format
        models/
            Tenant.js
            User.js
            Ticket.js
            Message.js
            FAQ.js
            Analytics.js
        routes/
            auth.routes.js
            ticket.routes.js
            chat.routes.js
            admin.routes.js
            ai.routes.js
            analytics.routes.js
            widget.routes.js
        controllers/            One file per route group, thin -- delegates to services
        services/
            ai.service.js       LLM integration -- classify, suggest, summarize, auto-reply
            routing.service.js  Smart ticket routing logic
            cache.service.js    Redis get/set/del helpers with TTL
            analytics.service.js  Aggregation pipeline builders
        socket/
            index.js            Socket.IO server + Redis adapter init
            auth.js             Socket auth middleware
            chatHandler.js      join, leave, send, typing events
            notificationHandler.js  ticket:new, ticket:assigned events
        utils/
            generateToken.js    JWT sign/verify helpers
            prompts.js          All LLM prompt templates
            apiKey.js           Widget API key generation and validation
        server.js               Entry point -- Express + Socket.IO + middleware chain
    Dockerfile
    .env.example
    package.json
```

---

### Frontend

```
frontend/
    public/
        widget-loader.js        Embeddable script
    src/
        app/
            store.js            Redux configureStore with all slices
            App.jsx             Router + layout wrapper
            index.css           Global resets + font imports
        design/
            tokens.css          All CSS custom properties
            Button.jsx + .css
            Card.jsx + .css
            Input.jsx + .css
            Badge.jsx
            Modal.jsx
            Sidebar.jsx
            Toast.jsx
            Skeleton.jsx
        features/
            auth/
                authSlice.js
                Login.jsx + .css
                Signup.jsx + .css
                ProtectedRoute.jsx
            chat/
                chatSlice.js
                ChatWindow.jsx + .css
                MessageBubble.jsx
                MessageInput.jsx
                TypingIndicator.jsx
                AISuggestionPanel.jsx
            tickets/
                ticketSlice.js
                TicketInbox.jsx + .css
                TicketCard.jsx
                TicketDetail.jsx + .css
                TicketFilters.jsx
            admin/
                adminSlice.js
                AdminLayout.jsx
                UserManagement.jsx + .css
                FAQManager.jsx + .css
                AISettings.jsx
                WidgetSettings.jsx
            analytics/
                analyticsSlice.js
                AnalyticsDashboard.jsx + .css
                StatCard.jsx
                Charts.jsx
            widget/
                WidgetContainer.jsx
                WidgetChat.jsx
                Widget.css
            landing/
                LandingPage.jsx + .css
                HeroSection.jsx
                FeatureCards.jsx
                HowItWorks.jsx
        hooks/
            useSocket.js
            useAuth.js
            useDebounce.js
        utils/
            api.js              Axios instance + JWT interceptor + auto-refresh on 401
            constants.js        Role enums, status enums, priority colors
        main.jsx
    vite.config.js
    package.json
```

---

## Backend Team (Akshat + Mayank)

### Phase 1 -- Foundation  *(do these first, in order)*

- [ ] **B1** -- `npm init`, install Express / Mongoose / ioredis / dotenv / cors / helmet / express-async-errors
- [ ] **B2** -- `src/config/env.js` -- load `.env`, throw if any required var is missing
- [ ] **B3** -- `src/config/db.js` -- Mongoose connect with exponential-backoff retry
- [ ] **B4** -- `src/config/redis.js` -- ioredis client, connection error logging
- [ ] **B5** -- `src/middleware/errorHandler.js` -- global async error catcher, consistent `{ success, message, stack? }` JSON
- [ ] **B6** -- `src/server.js` skeleton -- mounts middleware chain, starts HTTP server, imports DB + Redis

### Phase 2 -- Models + Security  *(run in parallel with Phase 1)*

- [ ] **B7** -- All 6 Mongoose models: `Tenant`, `User`, `Ticket`, `Message`, `FAQ`, `Analytics` with correct indexes
- [ ] **B8** -- `src/middleware/security.js` -- Helmet (CSP + HSTS), CORS whitelist, body limit 10kb, mongo-sanitize, xss-clean, hpp **in exact order**
- [ ] **B9** -- `src/middleware/rateLimiter.js` -- Redis sliding-window: 100 req/min global, 5 req/min on `/api/auth`
- [ ] **B10** -- `src/utils/generateToken.js` -- `signAccessToken`, `signRefreshToken`, `verifyToken`; access 15 min, refresh 7 days
- [ ] **B11** -- `src/utils/apiKey.js` -- `generateApiKey()` for widget, `validateApiKey(key)` checks DB

### Phase 3 -- Auth  *(depends on Phase 2)*

- [ ] **B12** -- `POST /api/auth/register` -- atomic: create Tenant doc + Admin user, return JWT pair
- [ ] **B13** -- `POST /api/auth/login` -- bcrypt compare, issue access token (body) + refresh token (httpOnly cookie)
- [ ] **B14** -- `POST /api/auth/refresh` -- validate cookie, blacklist old jti in Redis, return new pair
- [ ] **B15** -- `POST /api/auth/logout` -- blacklist refresh token jti in Redis (`bl:<jti>` key)
- [ ] **B16** -- `GET /api/auth/me` -- return user minus `passwordHash`
- [ ] **B17** -- `PUT /api/auth/profile` + `PUT /api/auth/password`
- [ ] **B18** -- `src/middleware/auth.js` -- check Redis blacklist → verify JWT → attach `req.user`
- [ ] **B19** -- `src/middleware/tenant.js` -- extract `tenantId` from `req.user`, attach `req.tenant`
- [ ] **B20** -- `src/middleware/rbac.js` -- `requireRole('admin')` factory, returns 403 if role mismatch

### Phase 4 -- Tickets + Chat  *(depends on Phase 3)*

- [ ] **B21** -- `GET /api/tickets` -- paginated list filtered by `status`, `assignedTo`, `priority`, scoped to `tenantId`
- [ ] **B22** -- `POST /api/tickets` -- create ticket, trigger AI classify + routing (stubs OK here, wire later)
- [ ] **B23** -- `GET /api/tickets/:id` -- ticket detail + populated `assignedTo`
- [ ] **B24** -- `PATCH /api/tickets/:id` -- update status / priority / assignment / category
- [ ] **B25** -- `POST /api/tickets/:id/notes` -- append internal note (agent-only field, not visible to customer)
- [ ] **B26** -- `POST /api/chat/:ticketId/messages` -- persist message → broadcast via Socket.IO room
- [ ] **B27** -- `GET /api/chat/:ticketId/messages` -- paginated history sorted ascending

### Phase 5 -- Socket.IO  *(depends on Phase 4)*

- [ ] **B28** -- `src/socket/index.js` -- attach Socket.IO to HTTP server, init Redis adapter (pub + sub clients)
- [ ] **B29** -- `src/socket/auth.js` -- socket middleware: JWT for agents, API key for widget connections
- [ ] **B30** -- `src/socket/chatHandler.js` -- `chat:join`, `chat:leave`, `chat:send` (persist + broadcast), `chat:typing`
- [ ] **B31** -- `src/socket/notificationHandler.js` -- `ticket:new`, `ticket:assigned`, `ticket:updated`, `agent:status`

### Phase 6 -- AI Layer  *(depends on Phase 5)*

- [ ] **B32** -- `src/utils/prompts.js` -- all 4 prompt templates: classify, auto-reply, agent-suggest, summarize
- [ ] **B33** -- `src/services/ai.service.js` -- `classifyMessage()` -- intent + confidence + sentiment + priority JSON
- [ ] **B34** -- `src/services/ai.service.js` -- `autoReply()` -- FAQ-grounded, returns `{ escalate: true }` when unsure
- [ ] **B35** -- `src/services/ai.service.js` -- `suggestReply()` -- full thread + FAQs → agent draft
- [ ] **B36** -- `src/services/ai.service.js` -- `summarizeTicket()` -- 2-3 sentence summary
- [ ] **B37** -- Wire `POST /api/tickets` to call classify + autoReply/routing after creation
- [ ] **B38** -- `POST /api/ai/suggest-reply` and `POST /api/ai/summarize/:ticketId` endpoints

### Phase 7 -- Admin + Analytics + Widget

- [ ] **B39** -- `src/services/routing.service.js` -- match intent to agent specialization → check Redis online set → assign lowest load
- [ ] **B40** -- Admin users endpoints: `GET /api/admin/users`, `POST /api/admin/users/invite`, `PATCH /api/admin/users/:id/role`, `PATCH /api/admin/users/:id/status`
- [ ] **B41** -- Admin FAQ CRUD: `GET/POST /api/admin/faqs`, `PUT/DELETE /api/admin/faqs/:id` + invalidate FAQ Redis cache
- [ ] **B42** -- Admin settings: `GET /api/admin/settings`, `PUT /api/admin/settings/ai`, `PUT /api/admin/settings/widget`, `PUT /api/admin/settings/routing`
- [ ] **B43** -- `src/services/analytics.service.js` -- aggregation pipelines: overview totals, trends, per-agent stats, categories
- [ ] **B44** -- Analytics endpoints: `GET /api/analytics/overview`, `/trends`, `/agents`, `/categories` (all Admin-only, date range params)
- [ ] **B45** -- Widget endpoints: `GET /api/widget/config/:apiKey` (public), `POST /api/widget/session`
- [ ] **B46** -- `src/services/cache.service.js` -- Redis `get/set/del` wrappers with TTL + cache key patterns from Redis Strategy

### Phase 8 -- Infra + Deploy

- [x] **B47** -- Add compound MongoDB indexes to all collections (see schema index list in plan)
- [x] **B48** -- Input validation: Zod/Joi schemas for all request bodies, plug into `src/middleware/validate.js`
- [ ] **B49** -- `Dockerfile` -- multi-stage: builder → prod image, non-root user
- [ ] **B50** -- `docker-compose.yml` -- nginx + api-1/2/3 (YAML anchors) + mongo + redis, all with health checks
- [ ] **B51** -- `nginx.conf` -- `/api/` round-robin, `/socket.io/` ip_hash + Upgrade headers, `limit_req_zone`
- [ ] **B52** -- Deploy to Render/Railway: set all env vars, verify live URL responds
- [ ] **B53** -- Smoke test: hit every route, confirm `tenantId` isolation, confirm Redis adapter syncs across 2 instances

> **Critical rule:** Every single Mongoose query **must** include `tenantId: req.tenant`. Audit before submission.

---

## Frontend Team (Nikhil + Noor)

### Phase 1 -- Foundation  *(do these first, in order)*

- [ ] **F1** -- `npm create vite@latest` React template, install: react-router-dom, redux-toolkit, react-redux, axios, socket.io-client, recharts
- [ ] **F2** -- `src/design/tokens.css` -- all CSS custom properties from the Neo-Brutalism token table (colors, shadows, borders, fonts)
- [ ] **F3** -- Google Fonts import in `index.css`: Space Grotesk (display), Inter (body), JetBrains Mono (mono)
- [ ] **F4** -- `Button.jsx` -- 3px border, `--nb-shadow-md`, `translate(2px,2px)` hover, `translate(4px,4px)` active
- [ ] **F5** -- `Card.jsx` -- 2px border, `--nb-shadow-lg`, lavender bg, 0 border-radius
- [ ] **F6** -- `Input.jsx` -- 3px border, pastel blue focus + shadow-md; `Textarea` variant
- [ ] **F7** -- `Badge.jsx` -- priority color map; `Modal.jsx` -- backdrop + close; `Toast.jsx` -- slide-in/out; `Skeleton.jsx` -- pulse shimmer

### Phase 2 -- Redux + API  *(depends on Phase 1)*

- [ ] **F8** -- `src/app/store.js` -- `configureStore` with 6 slice reducers: auth, chat, tickets, admin, analytics, ui
- [ ] **F9** -- `src/utils/api.js` -- Axios instance: baseURL from env, request interceptor attaches `Authorization: Bearer <token>`, response interceptor calls `/auth/refresh` on 401 and retries once
- [ ] **F10** -- `src/utils/constants.js` -- role enums, status enums, priority-to-color map
- [ ] **F11** -- `authSlice.js` -- `loginThunk`, `registerThunk`, `getMeThunk`, `logoutThunk`; state: `{ user, token, status, error }`
- [ ] **F12** -- Mock API layer (JSON files or MSW) for all endpoints so UI dev is unblocked before backend is live

### Phase 3 -- Auth Pages  *(depends on Phase 2)*

- [ ] **F13** -- `Login.jsx` -- email + password form, error display, redirect to `/dashboard` on success
- [ ] **F14** -- `Signup.jsx` -- business name, name, email, password; calls register → creates tenant → redirect to `/dashboard`
- [ ] **F15** -- `ProtectedRoute.jsx` -- checks Redux auth state, redirects to `/login` if unauthenticated

### Phase 4 -- App Shell  *(depends on Phase 3)*

- [ ] **F16** -- `App.jsx` -- React Router routes: `/`, `/login`, `/register`, `/dashboard`, `/admin`, `/analytics`, `/settings`; calls `getMeThunk` on mount
- [ ] **F17** -- `Sidebar.jsx` -- role-based nav links (agent sees Inbox; admin sees Admin + Analytics too), 3px right border divider, active state highlight
- [ ] **F18** -- App layout wrapper -- sidebar (fixed width) + topbar (user name, logout) + main content area; hamburger collapse on mobile

### Phase 5 -- Dashboard  *(core feature, most important)*

- [ ] **F19** -- `useSocket.js` hook -- connect with `{ auth: { token } }`, expose `socket` ref, auto-reconnect, cleanup on unmount
- [ ] **F20** -- `ticketSlice.js` -- `fetchTickets`, `updateTicket`, `assignTicket` thunks; filters + pagination state
- [ ] **F21** -- `TicketInbox.jsx` -- left panel: filter buttons (Assigned to Me / Unassigned / Urgent / All Open), scrollable `TicketCard` list, real-time `ticket:new` updates via socket
- [ ] **F22** -- `TicketCard.jsx` -- priority badge, status indicator, truncated preview, unread dot
- [ ] **F23** -- `TicketFilters.jsx` -- filter pill buttons, active state styling
- [ ] **F24** -- `chatSlice.js` -- messages map by ticketId, typing map, `fetchMessages` thunk
- [ ] **F25** -- `ChatWindow.jsx` -- center panel: scrollable message list, auto-scroll to bottom on new message
- [ ] **F26** -- `MessageBubble.jsx` -- styled per `senderType`: customer (lavender), agent (white), AI (green tinted + dashed border + sparkle icon)
- [ ] **F27** -- `MessageInput.jsx` -- text input, send button, emits `chat:send` and `chat:typing` (debounced)
- [ ] **F28** -- `TypingIndicator.jsx` -- animated dots shown when `chat:typing` received
- [ ] **F29** -- `AISuggestionPanel.jsx` -- "AI Suggest" button calls `/api/ai/suggest-reply`, shows draft in yellow panel, Accept / Edit / Dismiss actions
- [ ] **F30** -- `TicketDetail.jsx` -- right panel: status dropdown, priority dropdown, assign-to agent selector, internal notes section, "AI Summarize" button
- [ ] **F31** -- Socket event wiring: `chat:message` → dispatch to chatSlice; `ticket:new` / `ticket:updated` / `ticket:assigned` → dispatch to ticketSlice; show toast via uiSlice

### Phase 6 -- Admin Panel

- [ ] **F32** -- `AdminLayout.jsx` -- tab nav: Users / FAQs / AI Settings / Widget / Routing; admin role guard
- [ ] **F33** -- `UserManagement.jsx` -- agent table (name, email, role, status, last active), Invite button → modal with email + role fields, role/status dropdowns per row
- [ ] **F34** -- `FAQManager.jsx` -- searchable list, add FAQ form (question + answer + category), inline edit, delete with confirm
- [ ] **F35** -- `AISettings.jsx` -- toggle auto-reply, confidence threshold slider (0.5-1.0), tone selector, model selector
- [ ] **F36** -- `WidgetSettings.jsx` -- accent color picker, greeting text input, copy-to-clipboard embed code

### Phase 7 -- Analytics

- [ ] **F37** -- `analyticsSlice.js` -- `fetchOverview`, `fetchTrends`, `fetchAgentStats` thunks; date range state
- [ ] **F38** -- `StatCard.jsx` -- large number, label, trend indicator (up/down arrow + % change)
- [ ] **F39** -- `Charts.jsx` -- Recharts `LineChart` for ticket volume (7d/30d toggle) + `BarChart` for tickets by priority; thick 3px strokes, flat fills matching Neo-Brutalism palette, no rounded bars
- [ ] **F40** -- `AnalyticsDashboard.jsx` -- 4 stat cards row + trend chart + agent performance table

### Phase 8 -- Widget + Landing

- [ ] **F41** -- `WidgetChat.jsx` -- standalone chat UI: message bubbles, input, typing indicator, minimize button, unread badge
- [ ] **F42** -- `WidgetContainer.jsx` -- floating bubble → expands to chat; connects via `{ auth: { apiKey, sessionToken } }`; session persisted in localStorage
- [ ] **F43** -- `Widget.css` -- fully scoped CSS (all selectors prefixed `velox-widget-*`); no global style bleed
- [ ] **F44** -- `public/widget-loader.js` -- vanilla JS: injects iframe or shadow DOM, passes API key from `<script data-api-key>` attribute
- [ ] **F45** -- `LandingPage.jsx` -- hero ("AI-first support"), How It Works (3-step), feature cards, comparison table (Average Team vs Velox), CTA buttons
- [ ] **F46** -- `HeroSection.jsx` -- bold headline, animated widget preview mock, "Start Free" + "See Demo" buttons

### Phase 9 -- Polish  *(run alongside Phase 5-8)*

- [ ] **F47** -- `Toast.jsx` wired to `uiSlice.notifications` -- auto-dismiss 5s, slide-in from top-right
- [ ] **F48** -- Skeleton loaders for ticket inbox, chat window, analytics cards while data fetches
- [ ] **F49** -- Empty states for all lists (no tickets, no FAQs, no agents)
- [x] **F50** -- Error boundaries around Dashboard, Admin, Analytics
- [ ] **F51** -- Responsive layout: test at 320px / 768px / 1024px / 1440px -- inbox collapses on mobile, drawer nav
- [ ] **F52** -- Micro-animations: card hover lift, button press tactile, typing dots bounce, toast slide-in
- [ ] **F53** -- Seed Redux store with demo data (3 tickets, some messages) so demo never starts on empty screen

---

## Shared Checkpoints

| Checkpoint | When | Who checks |
|------------|------|------------|
| Auth E2E (register → login → dashboard) | After B12-B20 + F13-F16 | Both teams |
| Real-time message appears in both browsers | After B28-B31 + F19-F31 | Both teams |
| AI suggest works in agent panel | After B32-B38 + F29 | Both teams |
| Demo flow runs start to finish | 6 hours before submission | All 4 |
| Every Mongoose query has `tenantId` filter | Pre-submission audit | Akshat |
| No rounded corners anywhere in UI | Pre-submission audit | Noor |
