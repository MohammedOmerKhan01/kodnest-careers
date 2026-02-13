# KodNest Careers Monorepo (Scaffold)

This repository is a pnpm workspace monorepo for the KodNest Careers platform, structured as a modular monolith with a separate worker app.

## Prerequisites

- Node.js and pnpm installed
- Docker and Docker Compose installed

## Getting started (local, scaffold only)

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Start infrastructure services:
   - `pnpm install`
   - `pnpm infra:up`
3. Once application packages are implemented, you will be able to run web and worker apps:
   - `pnpm dev:web`
   - `pnpm dev:worker`

## Structure (high level)

- `apps/web` - Next.js web application (App Router).
- `apps/worker` - Background worker, queues, jobs, and schedulers.
- `packages` - Shared modules (db, domain modules, ai gateway, events, shared utilities, config).
- `infra` - Local infrastructure (Postgres, Redis, Mailpit) and scripts.
- `docs` - Product, architecture, runbooks, and testing documentation.

All feature code and business logic are intentionally left as placeholders at this stage.
