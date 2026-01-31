# GitHub Actions & Security Setup (Simplified)

## Current Setup
- **Repo**: Private GitHub repository
- **Deployment**: Vercel (auto-deploy)
- **Team**: 3 developers
- **Package Manager**: npm
- **Node Version**: 20+

---

## Files Created

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Lint, typecheck, build on PRs |
| `.github/CODEOWNERS` | Require review for sensitive paths |
| `.github/dependabot.yml` | Weekly dependency updates |
| `.github/pull_request_template.md` | Standardized PR descriptions |
| `.env.example` | Document required env vars |
| `SECURITY.md` | Vulnerability reporting guide |

---

## Branch Strategy with Staging

### Recommended Flow

```
feature-branch → staging → main
                    ↓         ↓
              Vercel       Vercel
              Preview      Production
```

### Setup Steps

1. **Create staging branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b staging
   git push -u origin staging
   ```

2. **Configure Vercel** (vercel.com → Project Settings → Git)
   - Production Branch: `main`
   - Preview Branches: `staging`, `feature/*`, etc.

   Vercel auto-creates preview URLs for non-main branches.

3. **Configure GitHub Branch Protection** (Settings → Branches)

   **For `main` branch:**
   - [x] Require a pull request before merging
   - [x] Require approvals: 1
   - [x] Dismiss stale approvals on new commits
   - [x] Require status checks to pass
     - Select: `validate` (from CI workflow)
   - [x] Require branches to be up to date
   - [x] Do not allow bypassing the above settings

   **For `staging` branch:**
   - [x] Require status checks to pass
     - Select: `validate`
   - [ ] Approvals optional (faster iteration)

4. **Enable Security Features** (Settings → Security)
   - [x] Secret scanning
   - [x] Push protection (blocks commits with secrets)

---

## Workflow

### Daily Development
1. Create feature branch from `staging`
   ```bash
   git checkout staging
   git pull
   git checkout -b feature/my-feature
   ```

2. Push and create PR to `staging`
3. CI runs automatically
4. After approval, merge to `staging`
5. Test on Vercel preview URL

### Production Release
1. Create PR from `staging` → `main`
2. Review changes (summary of what's deploying)
3. Merge → auto-deploys to production

---

## CODEOWNERS Paths

Changes to these paths require explicit approval:

| Path | Sensitivity |
|------|-------------|
| `/app/actions/auth*` | Authentication |
| `/lib/supabase/` | Database access |
| `/app/actions/prescriptions.ts` | Medical data |
| `/app/actions/appointments.ts` | Patient data |
| `/app/[lang]/checkout/` | Payments |
| `/app/api/daily/` | Video calls |
| `/app/[lang]/dashboard/admin/` | Admin functions |

---

## Dependabot

- Runs weekly on Mondays
- Groups minor/patch updates
- Ignores major version bumps for Next.js, React (review manually)
- Max 5 open PRs at a time

---

## What's NOT Included (Intentionally)

| Feature | Reason |
|---------|--------|
| CodeQL | Adds CI time; most issues are dependency-related (covered by Dependabot) |
| GitHub Environments | Vercel already handles preview/production |
| Signed commits | Adds friction for small team |
| npm audit in CI | High false positive rate; Dependabot is better |
| E2E tests | Add later when you have test coverage |

---

## Future Improvements (When Needed)

### Phase 2: Testing (When Ready)
1. Install Vitest: `npm install -D vitest`
2. Add test script to package.json
3. Start with utility/validation tests
4. Add API route tests
5. Add E2E tests for critical flows

### Phase 3: Advanced Security (If/When Scaling)
1. Add CodeQL for deeper static analysis
2. Add SAST scanning
3. Implement audit logging for PHI access
4. Add rate limiting monitoring

---

## Quick Reference

### Branch Protection Checklist
- [ ] `main`: Require PR + 1 approval + CI pass
- [ ] `staging`: Require CI pass
- [ ] Enable secret scanning
- [ ] Enable push protection

### First-Time Setup Commands
```bash
# Create staging branch
git checkout main && git checkout -b staging && git push -u origin staging

# Verify CI works
git checkout -b test/ci-check
echo "# test" >> test.md
git add . && git commit -m "test: verify CI"
git push -u origin test/ci-check
# Create PR on GitHub, verify CI runs
# Delete branch after
```
