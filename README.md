# Video Editing Project Tracker

A modern monthly tracker for video editing projects built with Next.js 15 App Router, JavaScript, Tailwind CSS, shadcn-style UI components, SQLite, and Prisma.

## Features

- Monthly dashboard with totals, status counts, overdue count, and earnings.
- Personal login account with name, email, password, and profile image.
- Sidebar navigation for Dashboard, All Projects, Monthly Projects, Invoices, and Profile.
- Collapsible monthly project sections and a month side panel.
- Cleaner project list rows with details shown in a side drawer.
- Status window for Pending, Doing, and Completed projects.
- Printable monthly invoice with separate PHP and USD totals.
- Project CRUD with title, client, status, project link, dates, notes, priority, payment status, rate, and currency.
- PHP and USD currency formatting with separate totals when both currencies exist.
- Search, client filter, payment filter, currency filter, and month selector.
- Light and dark mode.
- Responsive SaaS-style dashboard UI.

## Setup

```bash
npm install
npm run db:generate
npm run db:migrate -- --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Commands

```bash
npm run lint
npm run build
npm run db:studio
```

## Database

The SQLite database is stored at `prisma/dev.db`. The schema is defined in `prisma/schema.prisma`.

If Prisma migrate cannot run because of a local engine issue, use:

```bash
npm run db:init
```

The first time you open the app, the login screen creates your personal account. After that, sign in with the same email and password.
