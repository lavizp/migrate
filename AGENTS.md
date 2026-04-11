# AGENTS.md

## Commands

- `bun run dev` - Start all apps (web + server + native)
- `bun run dev:web` - Web only (localhost:5173)
- `bun run dev:server` - Server only (localhost:3000)
- `bun run dev:native` - Expo dev server
- `bun run check-types` - TypeScript check across all packages
- `bun run db:push` - Push Drizzle schema to PostgreSQL
- `bun run db:generate` - Generate Drizzle client
- `bun run db:studio` - Open Drizzle Studio UI

## Architecture

```
apps/
  web/      # React + TanStack Router (port 5173)
  server/  # Express API (port 3000)
  native/  # React Native + Expo
packages/
  ui/       # Shared shadcn/ui components
  db/       # Drizzle schema & queries
```

## Key Conventions

- Uses Bun (not npm/pnpm/yarn) - `bun install`, `bun run ...`
- Turborepo monorepo - use `turbo -F <package> <task>` for single-package tasks
- Database: PostgreSQL + Drizzle ORM + `apps/server/.env`
- UI package: Add components via `npx shadcn@latest add <component> -c packages/ui`
- Import shared UI: `import { Button } from "@migrate/ui/components/button"`

## Setup

1. `bun install`
2. Configure `apps/server/.env` with PostgreSQL credentials
3. `bun run db:push` to create tables
4. `bun run dev` to start

## Known Issues

- Environment file location: `apps/server/.env` (not root)