<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Web application instructions

- Keep the app compatible with Next.js (App Router), Tailwind CSS, and Vercel.
- Preserve the existing browser API configuration through `NEXT_PUBLIC_API_URL`.
- Treat every `NEXT_PUBLIC_*` value as public; never put secrets in frontend code or client-accessible environment files.
- Keep UI behavior responsive and accessible.
- Preserve page routing and existing backend API contracts unless explicitly asked to change them.
- Add or update tests for behavior changes when practical.
- Update `apps/web/.env.example` when adding a frontend configuration variable.

Use these commands from the repository root:

```sh
pnpm --filter @merit-gate/web dev
pnpm --filter @merit-gate/web build
pnpm --filter @merit-gate/web lint
pnpm --filter @merit-gate/web test
```
