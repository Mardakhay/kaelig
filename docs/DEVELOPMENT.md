# Development guide

## Local setup

1. Install a supported Node.js release and npm.
2. Run `npm ci` from the repository root.
3. Copy `.env.example` to `.env` and populate the values required by the features you need.
4. Start the dev server with `npm run dev`.

Never commit `.env`, credentials, exported user data, or build outputs.

## Quality checks

Run these checks before publishing a change:

```bash
npm run lint
npm run test
npm run build
```

The build script runs TypeScript project builds before Vite bundling. Unit tests use Vitest and are colocated with the modules being tested. For a fast edit loop, run `npm run test:watch`.

## Change workflow

1. Reproduce the issue or define the behavior that should change.
2. Make the smallest change that fixes the behavior without broad unrelated refactors.
3. Add or update a regression test for bug fixes.
4. Run lint, tests, and build; inspect any failures rather than suppressing them.
5. Review the final diff for secrets, accidental generated-file churn, accessibility regressions, and unrelated formatting changes.
6. Commit with a concise, imperative message describing the change, consistent with existing history (for example, `Fix stale request handling` or `Document local setup and database requirements`).

## Test coverage priorities

- Library store: optimistic success/failure, rollback, status moves, stale hydration, session reset, pending state, and Realtime row changes.
- API client: missing configuration, query-parameter serialization, request cancellation, non-2xx responses, malformed error payloads, and successful responses.
- Authentication: session initialization, sign-in/sign-up failures, profile loading failures, and user switches.
- UI: empty/loading/error states, responsive navigation, keyboard access, and screen-reader labels.

## Troubleshooting

### RAWG data does not load

Confirm `VITE_RAWG_API_KEY` exists in the environment used by Vite. Restart the dev server after changing `.env`. Verify the key and API quota in RAWG's dashboard.

### Authentication or cloud library is unavailable

Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Confirm the Supabase project is reachable, the expected tables and columns exist, and RLS policies permit the current user's intended operations. The browser must only receive a publishable/anon key—not a service-role or secret key.

### Library does not sync between devices

Confirm Realtime is enabled for `public.library_games`, the subscription is authorized by the current user's session, and the table's RLS and publication configuration are correct. Refresh once to distinguish a Realtime delivery problem from a persistence/hydration problem.

### A library change appears briefly and reverts

Optimistic updates are rolled back when the database rejects a write. Check the browser console and Supabase logs for the actual database error, then verify constraints, grants, and RLS policies rather than disabling rollback.
