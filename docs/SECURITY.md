# Security and deployment checklist

## Browser-visible configuration

Every variable prefixed with `VITE_` is bundled into the client application. Treat all values with that prefix as public.

- Use a RAWG key intended for browser use and configure provider-side usage limits/restrictions where available.
- Use only a Supabase publishable key or legacy anon key in the browser.
- Never expose Supabase service-role keys, secret keys, database passwords, or privileged access tokens.
- Do not treat obfuscation or minification as secret protection.

## Supabase access controls

The frontend is not a security boundary. Configure and verify database security before storing real user data.

- Enable RLS on exposed tables such as `profiles` and `library_games`.
- Restrict library rows to the authenticated owner with `(select auth.uid()) = user_id`.
- For updates, enforce ownership in both the row-selection condition (`USING`) and the resulting-row condition (`WITH CHECK`).
- Restrict profile reads and updates to the matching user's ID.
- Add a unique constraint on `library_games(user_id, game_id)`.
- Grant only required privileges to the intended API roles.
- Do not use editable user metadata as an authorization claim.
- Keep production database changes in reviewed, reproducible migrations.

The exact SQL depends on the existing schema and policies. Inspect the live schema and current policies before applying changes; blindly adding generic policies can broaden access or conflict with existing policies.

## Authentication and privacy

- Supabase manages credentials and sessions; do not store passwords yourself.
- Do not include access tokens, passwords, API keys, or personal data in logs, issue reports, screenshots, or analytics events.
- Keep sign-in, sign-up, sign-out, and profile queries error-aware.
- A client-side route guard improves navigation but does not replace RLS.
- Consider rate limits and abuse controls for public APIs and authentication flows.

## Release checklist

- [ ] All required production environment variables are configured in the hosting provider.
- [ ] No secret/service-role key is exposed through client variables or committed files.
- [ ] RLS is enabled and tested using separate users, including attempts to read or change another user's rows.
- [ ] Auth callback URLs and allowed origins are restricted to expected environments.
- [ ] Database schema changes are versioned and reviewed.
- [ ] `npm run lint`, `npm run test`, and `npm run build` pass in CI.
- [ ] Browser console and network logs contain no secrets.
- [ ] Public API usage and quotas are monitored.
