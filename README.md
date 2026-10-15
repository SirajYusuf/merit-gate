# Merit Gate monorepo

This repository contains two independently deployable applications managed with pnpm workspaces and Turborepo:

- `apps/api` — Express/MongoDB/BullMQ backend
- `apps/web` — Next.js frontend

There is currently no `packages/shared` package: the applications do not share runtime code, types, schemas, or constants.

## Local development

Install pnpm 9+ and Node.js 20+, then run:

```sh
pnpm install
pnpm dev
```

Configure your environment variables in `apps/api/.env` and `apps/web/.env` (see the `.env.example` templates in each app for required keys). Never commit `.env` files or credentials.

To run the background embedding worker alongside the API server:
```sh
pnpm --filter @merit-gate/api worker
```

Run one app independently:
```sh
pnpm --filter @merit-gate/api dev
pnpm --filter @merit-gate/web dev
```

## Checks

Run repository-wide checks using Turborepo:

```sh
pnpm build
pnpm lint
pnpm test
```

Application-specific commands:
- API: `pnpm --filter @merit-gate/api start`
- Web: `pnpm --filter @merit-gate/web build`

## Deployment

### Render / Server (API)

Create/use a Web Service with **Root Directory** `apps/api`.

- Build command: `pnpm install --frozen-lockfile`
- Start command: `pnpm start`
- Configure environment variables from `apps/api/.env.example` in the dashboard.

### Vercel (Web)

Set the project **Root Directory** to `apps/web` and select framework preset **Next.js**.

- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: Next.js default (`.next`)
- Environment variable: `NEXT_PUBLIC_API_URL` pointing at the deployed API URL.

### Deployment filtering

Configure each provider's Git "Ignored Build Step" to skip unrelated changes:

- API: `git diff --quiet HEAD^ HEAD -- apps/api packages`
- Web: `git diff --quiet HEAD^ HEAD -- apps/web packages`
