# Velox Development Guidelines

## Mission

Treat this project as a production-grade SaaS application.

Do NOT rewrite architecture unless absolutely necessary.

Always prefer fixing root causes over workarounds.

Never replace real backend logic with mocks.

If backend functionality already exists, make the frontend consume it correctly instead of recreating logic.

---

## Code Review Graph

Always use Code Review Graph before making significant changes.

When debugging:

1. Build dependency graph
2. Trace execution path
3. Identify dead code
4. Identify disconnected frontend/backend flows
5. Find duplicate implementations
6. Find unused APIs
7. Find stale mock data
8. Find broken imports
9. Find routing mismatches
10. Find missing providers

Use CRG to minimize unnecessary file reads.

---

## Debugging Order

Always investigate in this order:

Frontend
↓

API Layer

↓

Backend Routes

↓

Controllers

↓

Services

↓

Database

↓

Socket Layer

Never randomly edit files.

Always prove the root cause first.

---

## Before Editing

Before changing code:

- explain WHY
- explain HOW it broke
- explain WHY this fix works

---

## Backend

Never remove:

- authentication
- RBAC
- socket support
- Redis support
- AI integration

unless they are genuinely unused.

---

## Frontend

Avoid mock data.

Avoid fake loading states.

Prefer React Query over manual fetches.

Prefer Zustand for global state.

---

## Responses

Keep responses concise.

Use bullet points.

Show discovered issues.

Show proposed fixes.

Only then modify code.

---

## Goal

The objective is NOT to pass compilation.

The objective is to produce a fully functional customer support platform where frontend and backend are completely integrated.