# Merit Gate engineering instructions

These rules apply to the entire repository. More specific `AGENTS.md` files in an app directory add rules for that app.

## Repository structure

- `apps/api` is the Express/MongoDB backend with BullMQ workers.
- `apps/web` is the Next.js (App Router) frontend.
- `packages/shared` is reserved for code genuinely imported by both applications. Do not create shared packages for appearance only.
- Preserve the independent deployment behavior of both apps when changing the monorepo.

## Package management

- Use pnpm and run workspace commands from the repository root.
- Keep `pnpm-lock.yaml` in sync with dependency changes.
- Prefer workspace filters for app-specific commands, for example `pnpm --filter @merit-gate/api build`.
- Do not edit generated lockfiles manually.

## Code and change standards

- Make the smallest focused change that satisfies the request.
- Preserve existing API contracts and user-visible behavior unless a breaking change is explicitly requested.
- Prefer clear, small modules and descriptive names over clever abstractions.
- Do not add dependencies without explaining their purpose and maintenance impact.
- Do not overwrite unrelated existing work.
- Update documentation when commands, environment variables, or deployment behavior changes.

## Environment and security

- Never commit `.env` files, credentials, tokens, private keys, database URLs, or other secrets.
- When adding configuration, update the relevant `.env.example` with safe placeholder values.
- Treat all `NEXT_PUBLIC_*` values as public: never put secrets in frontend environment variables.
- Do not log secrets or return stack traces in production responses.

## Validation

Before finishing a change, run the checks relevant to it. For repository-wide changes, run:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm lint
pnpm test
```

If a check cannot run, report the exact command and blocker. Do not claim an unrun check passed.

## Deployment boundaries

- Render / VM root directory: `apps/api`.
- Vercel root directory: `apps/web`.
- Backend-only changes must not trigger a web deployment; frontend-only changes must not trigger an API deployment.
- Changes to a shared package must trigger every app that consumes it.
- Update the root README when deployment commands or provider settings change.

## Git and file safety

- Do not use destructive commands such as `git reset --hard` or broad deletion unless explicitly requested.
- Keep generated output, uploads, dependencies, and local environment files ignored.
- Keep commits and changes reviewable; do not mix unrelated formatting or refactors into feature work.
