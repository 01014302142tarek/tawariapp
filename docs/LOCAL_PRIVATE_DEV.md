# Local development without touching production

Run the app on your machine **without notifying GitHub** and **without using the owner’s Supabase project**.

## What stays private

| Action | Visible to repo owner? | Visible to DB owner? |
|--------|------------------------|----------------------|
| `npm run dev` on localhost | No | No |
| Edits without `git push` | No | No |
| API calls with **your** Supabase keys | No | Only **your** Supabase dashboard |
| API calls with **their** Supabase keys | No | **Yes** — avoid this |

## One-time setup

1. **Create your own Supabase project** (free tier): [supabase.com/dashboard](https://supabase.com/dashboard) → New project.

2. **Configure env (local only)**:
   ```bash
   npm run setup:local
   ```
   Or copy `.env.local.template` → `.env.local` and paste **Settings → API** keys from **your** project.

3. **Apply schema** (your project only):
   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

4. **Seed test users** (script prompts, or):
   ```bash
   npx tsx scripts/seed-test-users.ts
   ```

5. **Run**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/en` — login `patient1@tawari.test` / `TawariPatient1!2024`.

## Do not

- Commit `.env.local` (gitignored).
- Paste production / teammate Supabase keys into `.env.local`.
- `git push` to their repo if you do not want them to see changes.

## Optional

- Leave `DAILY_API_KEY`, `RESEND_API_KEY`, Paymob vars **empty** for local UI + DB testing.
- Vercel Analytics / Speed Insights load only in **production** builds.

## Verify env

```bash
npm run env:check
```
