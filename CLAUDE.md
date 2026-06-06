# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Zor IK** — A multi-tenant HR SaaS platform built for Turkish labor law compliance. Handles employee management, leave tracking, payroll calculation, attendance (PDKS/RFID), shift management, and approval workflows.

## Commands

```bash
npm run dev          # Start dev server (Next.js)
npm run build        # prisma generate && next build
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to DB (dev)
npx prisma migrate dev --name <name>  # Create migration
npm run db:seed      # Seed database (npx tsx prisma/seed.ts)
npm test             # Run Vitest unit tests (vitest run)
npm run test:watch   # Vitest in watch mode
```

**Testing**: Vitest is configured for the pure domain engines. Tests live in `tests/`
and cover `payroll-engine`, `leave-engine`, and `attendance-calc` (pure PDKS logic
extracted from `pdks-engine` so it runs without a DB). DB-touching code is not unit-tested.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **PostgreSQL** + **Prisma 6** ORM
- **NextAuth v4** with JWT sessions (credentials provider)
- **Tailwind CSS 4** + **shadcn/ui** (Radix-based components)
- **react-hook-form** + **Zod** for forms/validation
- **date-fns** with Turkish locale for dates

## Architecture

### Route Structure

- `app/(dashboard)/` — Auth-protected route group. Server-side session check in layout redirects to `/login` if unauthenticated.
- `app/api/` — REST API routes. All API handlers verify session and `companyId` for multi-tenant isolation.
- All UI text is in **Turkish**. HTML lang is `tr`.

### Authentication & Authorization

- **NextAuth JWT** — Session contains: `id`, `role`, `companyId`, `departmentName`
- **Roles**: `SUPER_ADMIN` > `COMPANY_ADMIN` > `MANAGER` > `EMPLOYEE`
- **HR detection**: Users in department named "İK" or "İnsan Kaynakları" get HR-specific sidebar items and approval powers
- **RBAC**: `RolePermission` table controls per-company feature access (canView/canEdit per resource per role)
- Key helpers in `lib/auth.ts`: `getServerAuthSession()`, `requireAuth()`

### Multi-Tenancy

Every query must filter by `companyId` from the session. This is enforced at the API route level, not via Prisma middleware.

### Domain Engines (lib/)

- **`payroll-engine.ts`** — 2026 Turkish tax calculation: SGK, İşsizlik, progressive income tax brackets, Damga Vergisi, minimum wage exemption. Supports gross→net and net→gross (binary search). Uses cumulative income for bracket progression.
- **`leave-engine.ts`** — Working day calculation (excludes weekends + holidays), seniority-based leave quotas per Turkish labor law (14/20/26 days).
- **`pdks-engine.ts`** — Processes RFID card swipes, calculates late/early/overtime minutes, one AttendanceLog per employee per day.
- **`status-helpers.tsx`** — Reusable status badge components for leave/attendance states.

### Approval Workflow

Two-tier approval for leave requests and attendance corrections:
1. Manager approves → status moves to manager-approved
2. HR approves → status moves to fully approved

Approval records stored in `Approval` model with `approverRole` tracking.

### Key Patterns

- **Server components by default**, `"use client"` only when needed
- **No global state** beyond NextAuth session — data fetched per-page via API calls
- **Sonner** for toast notifications, **no alert/confirm dialogs**
- **Zod schemas** in `lib/validations/` for shared form + API validation
- **`cn()` utility** (`lib/utils.ts`) — `clsx` + `tailwind-merge` for className composition
- **Path alias**: `@/*` maps to project root

### Environment Variables

```
DATABASE_URL, DIRECT_URL    # PostgreSQL (pooled / direct)
NEXTAUTH_URL, NEXTAUTH_SECRET
NEXT_PUBLIC_APP_URL
PDKS_API_KEY                # RFID reader webhook auth
```

---

## Workflow Rules

### 1. Plan First
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Review lessons at session start

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes — don't over-engineer

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards
- **Multi-tenant safety**: Always filter by `companyId` — never leak data across tenants
- **Turkish context**: All user-facing text in Turkish, dates in `tr` locale
