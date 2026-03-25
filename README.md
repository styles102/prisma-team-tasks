# Team Tasks

A multi-tenant team task management app built with Next.js, Prisma, and Better Auth. Organise work across projects using a Trello-style kanban board with drag-and-drop.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |
| Auth | Better Auth 1.5 |
| UI | shadcn/ui + Tailwind CSS v4 |
| Drag & Drop | dnd-kit |
| Package Manager | pnpm |

## Features

- Email/password authentication via Better Auth
- Multi-tenant — users belong to an organisation, data is scoped accordingly
- Project dashboard with per-project task counts
- Kanban board with three columns: **To Do**, **In Progress**, **Done**
- Drag cards between columns to update status
- Create tasks with title, description, due date, and optional self-assignment
- Filter board to show only tasks assigned to you
- Overdue task highlighting

## Prerequisites

- Node.js 18+
- pnpm
- Docker (for the local database)

## Getting Started

### 1. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 instance on port `5432` and Adminer (DB GUI) on port `8080`.

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/team_tasks
BETTER_AUTH_SECRET=your-secret-here
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

Generate a secure `BETTER_AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Run database migrations

```bash
pnpm dlx prisma migrate dev
```

### 5. Seed the database

```bash
pnpm seed
```

This creates sample organisations, users (password: `Test123!`), projects, and tasks.

### 6. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with any seeded user email and the password `Test123!`.

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── dashboard/
│   │       ├── page.tsx                  # Project dashboard
│   │       └── projects/[id]/
│   │           ├── page.tsx              # Kanban board (server)
│   │           ├── ProjectBoard.tsx      # Kanban board (client, drag & drop)
│   │           └── actions.ts            # Server actions
│   ├── api/
│   │   ├── auth/[...all]/route.ts        # Better Auth handler
│   │   └── projects/route.ts            # Projects API
│   └── page.tsx                          # Login page
├── components/
│   ├── ui/                               # shadcn/ui components
│   └── SignOutButton.tsx
├── lib/
│   ├── auth.ts                           # Better Auth server config
│   ├── auth-client.ts                    # Better Auth client config
│   └── prisma.ts                         # Prisma client
└── seeds/
    ├── index.ts
    ├── organisationSeeder.ts
    ├── projectSeeder.ts
    ├── taskSeeder.ts
    └── userSeeder.ts
prisma/
└── schema.prisma
```

## Database Schema

The schema is multi-tenant — every resource is scoped to an `Organization`.

- **Organization** — top-level tenant
- **User** — belongs to one organisation; unique on `(orgId, email)` so the same email can exist across orgs
- **Project** — belongs to an organisation
- **Task** — belongs to a project, has a `TaskStatus` enum (`TODO`, `IN_PROGRESS`, `DONE`), and an optional assignee
- **Session / Account / Verification** — managed by Better Auth

## Useful Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm seed` | Seed the database |
| `pnpm dlx prisma migrate dev` | Run migrations |
| `pnpm dlx prisma studio` | Open Prisma Studio |
| `docker compose up -d` | Start database |
| `docker compose down` | Stop database |
