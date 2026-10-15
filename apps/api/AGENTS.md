# API application instructions

- Keep the existing Express entry point (`server.js`) and worker (`worker.js`) behavior working.
- Preserve the MongoDB connection and existing REST API routes unless a change is explicitly requested.
- Validate request input at API boundaries and return safe, useful error messages.
- Never expose credentials, connection strings, stack traces, or internal filesystem paths in responses.
- Keep uploaded runtime files under the ignored `public/uploads/` directory.
- Add or update tests for behavior changes when practical.
- Keep backend-only configuration in `apps/api/.env.example`; do not duplicate secrets into the frontend.

Use these commands from the repository root:

```sh
pnpm --filter @merit-gate/api dev
pnpm --filter @merit-gate/api worker
pnpm --filter @merit-gate/api build
pnpm --filter @merit-gate/api lint
pnpm --filter @merit-gate/api test
```
