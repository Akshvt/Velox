<div align="center">

# ⚡ Velox

### Resolution at the Speed of AI

A production-grade, multi-tenant customer support platform with real-time chat,
AI-powered ticket routing, and horizontal scaling — built for 10,000+ concurrent users.

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Multi-Tenant Auth** | JWT access/refresh tokens, httpOnly cookies, role-based access (Admin, Agent), Redis-backed token blacklisting |
| 🎫 **Ticket Management** | Full CRUD with status lifecycle (open → in-progress → resolved → closed), priority levels, agent assignment |
| 💬 **Real-Time Chat** | Socket.IO–powered live messaging between agents and customers with typing indicators |
| 🤖 **AI Integration** | LangChain + Mistral AI for automatic ticket classification, smart auto-replies, and conversation summaries |
| 📊 **Analytics Dashboard** | Real-time metrics — ticket volume, resolution times, agent performance, SLA tracking |
| 🛡️ **Admin Panel** | Manage users, FAQs, knowledge base articles, and tenant settings |
| 🔌 **Embeddable Widget** | Drop-in chat widget for any website — customers create tickets without leaving the page |
| 📱 **Responsive UI** | Mobile-first design with Tailwind CSS, Framer Motion animations, and GSAP-powered landing page |

---

## 🏗️ Architecture

```
                        ┌──────────────────────────────┐
                        │       Browser / Widget        │
                        └──────────────┬───────────────┘
                                       │
                                  Port 80/443
                                       │
                        ┌──────────────▼───────────────┐
                        │         Nginx (L7 LB)         │
                        │  Rate Limiting · Proxy Pass   │
                        └─────┬────────┬────────┬──────┘
                              │        │        │
                    ┌─────────▼──┐ ┌───▼─────┐ ┌▼─────────┐
                    │   api-1    │ │  api-2  │ │   api-3   │
                    │  Express   │ │ Express │ │  Express  │
                    │ Socket.IO  │ │Socket.IO│ │ Socket.IO │
                    └─────┬──────┘ └───┬─────┘ └┬─────────┘
                          │            │         │
                    ┌─────▼────────────▼─────────▼─────┐
                    │          Redis (Pub/Sub)          │
                    │  Token Blacklist · Socket Adapter │
                    └──────────────────────────────────┘
                    ┌──────────────────────────────────┐
                    │          MongoDB (Persistent)     │
                    │   Users · Tickets · Messages ·   │
                    │    FAQs · KB · Analytics          │
                    └──────────────────────────────────┘
```

- **Nginx** load-balances API requests (round-robin) and Socket.IO connections (`ip_hash` sticky sessions)
- **Redis** synchronises Socket.IO events across all 3 replicas and stores JWT blacklist entries
- **MongoDB** handles all persistent data with compound indexes for sub-millisecond queries

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 20 + Express | REST API server |
| Mongoose (MongoDB 6) | ODM with strict schemas |
| Socket.IO 4 | Real-time bidirectional communication |
| Redis 7 (ioredis) | Caching, pub/sub, token blacklisting |
| LangChain + Mistral AI | AI ticket classification and auto-reply |
| Zod | Runtime request validation |
| Helmet + CORS + HPP | Security headers and request hardening |
| express-mongo-sanitize + xss | Injection prevention |
| bcryptjs + JWT | Password hashing and stateless auth |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | SPA with fast HMR |
| Zustand | Lightweight state management |
| React Query (TanStack) | Server state + caching |
| Tailwind CSS | Utility-first styling |
| Framer Motion + GSAP | Animations and transitions |
| React Hook Form + Zod | Form handling with schema validation |
| Socket.IO Client | Real-time event handling |
| Axios | HTTP client with auto-refresh interceptor |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker Compose | Container orchestration (7 services) |
| Nginx | Reverse proxy, load balancer, rate limiter |
| Multi-stage Dockerfiles | Optimised production images |

---

## 🚀 Quick Start

### Prerequisites

- [Docker Engine 24+](https://docs.docker.com/engine/install/) with Compose v2
- [Git](https://git-scm.com/)

> You do **not** need Node.js, MongoDB, or Redis installed — Docker handles everything.

### Deploy

```bash
# 1. Clone
git clone https://github.com/DATBOI-MAYANK/Velox.git
cd Velox

# 2. Create root .env (Docker Compose secrets)
cp .env.example .env
# Generate JWT secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste the outputs into .env for JWT_ACCESS_SECRET and JWT_REFRESH_SECRET

# 3. Create frontend .env (build-time variables)
cp frontend/.env.example frontend/.env
# Default values work for local Docker. For a domain, update VITE_API_URL.

# 4. Build and launch
docker compose up --build -d

# 5. Verify
docker compose ps   # All 7 containers should be "Up" / "healthy"
```

Open **http://localhost** and register your first account.

> 📖 For the complete deployment guide (SSL, scaling, troubleshooting), see [DEPLOYMENT.md](./docs/DEPLOYMENT.md).

---

## 📁 Project Structure

```
Velox/
├── .env.example              # Root env template (Docker Compose secrets)
├── docker-compose.yml        # 7-service container orchestration
├── nginx.conf                # Reverse proxy + load balancer
│
├── backend/
│   ├── .env.example          # Backend env template
│   ├── Dockerfile            # Multi-stage Node.js 20 Alpine
│   ├── package.json
│   └── src/
│       ├── server.js          # Entry point (Express + Socket.IO + graceful shutdown)
│       ├── config/            # DB, Redis, env, AI service connections
│       ├── controllers/       # Route handlers (auth, tickets, chat, admin, AI, analytics)
│       ├── middleware/         # Security stack, auth, rate limiting, error handling
│       ├── models/            # Mongoose schemas (User, Ticket, Message, FAQ, KB, etc.)
│       ├── routes/            # Express route definitions
│       ├── socket/            # Socket.IO handlers (chat, notifications, auth)
│       ├── services/          # AI service (LangChain + Mistral)
│       └── utils/             # Token generation, validators
│
├── frontend/
│   ├── .env.example          # Frontend env template
│   ├── Dockerfile            # Multi-stage Vite build → Nginx static serve
│   ├── package.json
│   └── src/
│       ├── main.jsx           # App entry (React Query, Router, MSW guard)
│       ├── api/               # Axios client with auto-refresh interceptor
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route pages (Dashboard, Chat, Admin, Analytics, etc.)
│       ├── realtime/          # Socket.IO client + event catalog
│       ├── store/             # Zustand stores (auth)
│       └── styles/            # Global CSS + Tailwind config
│
└── docs/
    ├── DEPLOYMENT.md                  # Complete deployment guide
    └── SECURITY-SCALABILITY-REPORT.md # Security audit + 10k CCU scalability analysis
```

---

## 🤖 AI Integration (Core Differentiator)

Velox uses **LangChain + Mistral AI** to power four distinct AI capabilities, all grounded in the tenant's own FAQ/knowledge base to prevent hallucination:

| Capability | Trigger | What Happens |
|-----------|---------|--------------|
| 🏷️ **Intent Classification** | Every incoming customer message | Returns `{ intent, confidence, sentiment, priority }` — drives routing and auto-reply decisions |
| 💬 **Auto-Reply** | Confidence ≥ 0.7 + FAQ match | AI generates a FAQ-grounded response and sends it to the customer instantly. If unsure, returns `{ escalate: true }` and creates a ticket |
| ✍️ **Agent Suggestion** | Agent clicks "AI Suggest" | Analyses full conversation + FAQs → generates a draft reply. Agent reviews before sending — never auto-sent |
| 📝 **Summarization** | Agent clicks "Summarize" | Produces a 2-3 sentence summary of the entire ticket thread, stored on the ticket for quick context |

**Anti-hallucination design:** AI is always constrained to the tenant's FAQ data. If it cannot answer from provided context, it escalates to a human agent rather than guessing.

---

## 🎬 Demo Flow

The end-to-end journey that showcases every feature:

```
1. Customer visits a business website → opens the Velox chat widget
2. Customer asks "Where is my order?"
3. AI classifies intent → "Order Tracking" (confidence: 0.85)
4. AI auto-replies from FAQ knowledge base → customer gets instant answer
5. Customer asks a complex question AI can't answer (confidence: 0.4)
6. Ticket created automatically → AI sets title, priority, category
7. Smart routing assigns ticket to the best available agent
8. Agent's dashboard updates in real-time (Socket.IO notification)
9. Agent opens ticket → sees chat history + AI summary
10. Agent clicks "AI Suggest" → gets a draft reply → edits and sends
11. Customer sees the reply instantly in the widget
12. Agent marks ticket "Resolved" → analytics dashboard updates
```

---

## 🧠 State Management & Caching

### Client-Side
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Auth State | **Zustand** | Lightweight store for user session, tokens (in-memory — never localStorage) |
| Server State | **React Query (TanStack)** | Automatic caching, background refetching, stale-while-revalidate for all API data |
| Real-Time | **Socket.IO Client** | Live event-driven updates bypass the cache — tickets, messages, notifications |
| Forms | **React Hook Form + Zod** | Schema-validated forms with zero re-renders |

### Server-Side
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Query Cache | **Redis** | Tenant config (5 min TTL), FAQ by category (5 min), analytics (2 min), ticket lists (30s) |
| Token Blacklist | **Redis** | `bl:<jti>` keys for instant JWT revocation on logout |
| Rate Limiting | **Redis** | Sliding window counters per IP per endpoint |
| Pub/Sub | **Redis Adapter** | Cross-instance Socket.IO event synchronisation |

---

## ⚡ Performance

- **Compound MongoDB Indexes** on every collection — queries filter by `tenantId` + secondary fields without collection scans
- **Connection Pooling** — 50 connections in production, 10 in development
- **`.lean()` Queries** — returns plain JS objects instead of Mongoose documents for read-heavy routes
- **10kb Body Limit** — rejects oversized payloads before they hit the application
- **Redis Caching** — frequently-accessed data (tenant config, FAQs, analytics) served from memory
- **Graceful Shutdown** — `SIGTERM`/`SIGINT` handlers cleanly close HTTP server, Socket.IO, MongoDB, and Redis connections

---

## 🔒 Security

Velox is hardened for production with defence-in-depth:

- **Helmet.js** — 11+ HTTP security headers (CSP, HSTS, X-Frame-Options)
- **Strict CORS** — Only the configured `CLIENT_URL` origin is allowed
- **Rate Limiting** — Nginx-level (10 req/s burst 20) + Express-level (100 req/min) + Auth-specific sliding window (5 req/min)
- **Input Validation** — Zod schemas on every mutation endpoint
- **Injection Prevention** — `express-mongo-sanitize` strips `$` operators, `xss` library sanitises all user input
- **JWT Security** — Short-lived access tokens (15 min), httpOnly refresh cookies, Redis-backed JTI blacklisting for instant revocation
- **Tenant Isolation** — Every database query is scoped to `tenantId`; no cross-tenant data leakage is possible

> 📖 Full audit report: [docs/SECURITY-SCALABILITY-REPORT.md](./docs/SECURITY-SCALABILITY-REPORT.md)

---

## 📈 Horizontal Scaling

The default Docker Compose setup runs **3 Node.js replicas** behind Nginx:

```
Nginx (port 80)
  ├── /api/*        → round-robin → api-1, api-2, api-3
  └── /socket.io/*  → ip_hash    → api-1, api-2, api-3  (sticky sessions)
```

To add more replicas:
1. Duplicate an `api-N` block in `docker-compose.yml`
2. Add `server api-N:5000;` to both upstreams in `nginx.conf`
3. `docker compose up --build -d`

Socket.IO events stay synchronized across all replicas via the **Redis adapter** (`@socket.io/redis-adapter`). Kill any instance — the remaining ones continue serving without data loss.

> 📖 Full scaling guide: [DEPLOYMENT.md](./docs/DEPLOYMENT.md#9-scaling)

---

## 📱 Responsiveness

Every page is tested and functional across breakpoints:

| Breakpoint | Target |
|-----------|--------|
| 320px | Mobile phones |
| 768px | Tablets |
| 1024px | Small laptops |
| 1440px | Desktop / wide screens |

The agent dashboard adapts from a three-panel layout on desktop to a stacked drawer navigation on mobile.

---

## ✅ Hackathon Evaluation Criteria

| Criterion | How Velox Addresses It |
|-----------|----------------------|
| **Functional Authentication** | JWT access/refresh tokens, httpOnly cookies, register/login/logout, protected routes, RBAC (Admin/Agent) |
| **Database & Security** | MongoDB with Mongoose strict schemas, Helmet, CORS, rate limiting, mongo-sanitize, xss, Zod validation |
| **Admin Panel** | Full management: users, FAQs, knowledge base, AI settings, tenant configuration |
| **State Management & Caching** | Zustand (client state) + React Query (server cache) + Redis (server-side caching with TTL) |
| **Responsiveness** | Mobile-first Tailwind CSS, tested at 320px / 768px / 1024px / 1440px |
| **Gen AI Integration** | 4 AI capabilities (classify, auto-reply, suggest, summarize) via LangChain + Mistral — not a gimmick, it's the core product |
| **Deployment Ready** | Docker Compose (7 services), Nginx, multi-stage Dockerfiles, production `.env`, health checks |
| **UI/UX Quality** | Framer Motion + GSAP animations, clean dashboard design, toast notifications, skeleton loaders |
| **Performance** | Redis caching, compound indexes, connection pooling, `.lean()` queries, 10kb body limit |
| **Real-World Usability** | Solves a real problem: businesses embed one script tag and get AI-powered support instantly |
| **Horizontal Scaling (Bonus)** | 3 Node.js replicas + Nginx load balancing + Redis pub/sub for Socket.IO sync |

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Step-by-step deployment guide for a fresh server |
| [docs/SECURITY-SCALABILITY-REPORT.md](./docs/SECURITY-SCALABILITY-REPORT.md) | Security audit + 10k CCU scalability analysis |

---

## 👥 Team

Built for the hackathon by the Velox team.

---

## 📜 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
