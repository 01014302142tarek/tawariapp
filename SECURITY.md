# Security Policy

## Reporting a Vulnerability

**Please report security vulnerabilities privately.**

### Preferred Method
Use GitHub Security Advisories for private reporting:
1. Go to the repository → **Security** → **Advisories**
2. Click **"New draft security advisory"**
3. Fill in the vulnerability details

### Alternative
If GitHub Advisories is not possible, contact the repository owner directly.

### What to Include
- Clear description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Any suggested fixes (optional)

### Response Timeline
- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity (critical: ASAP, high: 14 days, medium: 30 days)

---

## Scope

The following areas are in scope for security reports:

| Area | Examples |
|------|----------|
| **Authentication & Authorization** | Login, session handling, role-based access |
| **Patient Data** | Medical records, appointments, prescriptions |
| **Doctor Data** | Profiles, credentials, verification status |
| **Payments** | Paymob integration, billing, transactions |
| **Video Consultations** | Daily.co integration, call privacy |
| **File Handling** | Uploads, document generation, prescriptions |
| **API Security** | Server actions, API routes, data validation |

---

## Security Measures in Place

### Repository Protection (GitHub Pro)

| Protection | Status | Description |
|------------|--------|-------------|
| Branch Protection | Enabled | `main` requires PR with approval |
| Code Owner Reviews | Enabled | Owner must approve all changes |
| Dismiss Stale Reviews | Enabled | New commits require re-approval |
| Force Push Blocked | Enabled | Cannot rewrite history on `main` |
| Branch Deletion Blocked | Enabled | Cannot delete `main` branch |
| Conversation Resolution | Enabled | Must resolve review comments |
| Protected Tags | Enabled | Release tags (`v*`) are protected |
| Branch Naming | Enforced | Must use `feature/`, `fix/`, etc. |

### Dependency Security

| Feature | Status | Description |
|---------|--------|-------------|
| Dependabot Alerts | Enabled | Notifies of vulnerable dependencies |
| Dependabot Security Updates | Enabled | Auto-creates PRs for security fixes |
| Dependabot Version Updates | Enabled | Weekly dependency updates |

### GitHub Actions Security

| Setting | Status | Description |
|---------|--------|-------------|
| Allowed Actions | Restricted | Only GitHub-owned and verified actions |
| Default Permissions | Read-only | Workflows have minimal permissions |
| PR Approval by Actions | Disabled | Workflows cannot approve PRs |

### Access Control

| Role | Permissions |
|------|-------------|
| Owner | Full admin access, manage secrets |
| Developers | Write access only, cannot access secrets |
| CI/CD | Read-only by default |

---

## Sensitive Paths

These paths contain sensitive code and require extra scrutiny:

```
/app/actions/auth*         # Authentication logic
/app/actions/appointments* # Patient appointment data
/app/actions/prescriptions*# Medical prescriptions
/app/api/                  # API routes
/lib/supabase/             # Database access
/supabase/migrations/      # Database schema
/middleware.ts             # Request handling
/app/[lang]/checkout/      # Payment flows
/app/[lang]/dashboard/admin/ # Admin functions
```

All changes to these paths require CODEOWNER approval.

---

## Environment Variables

**Never commit credentials to the repository.**

| Variable | Sensitivity | Access |
|----------|-------------|--------|
| `SUPABASE_URL` | High | Production: Admin only |
| `SUPABASE_SERVICE_ROLE_KEY` | Critical | Production: Admin only |
| `DAILY_API_KEY` | High | Production: Admin only |
| `PAYMOB_*` | Critical | Production: Admin only |
| `FIREBASE_*` | High | Production: Admin only |

### For Developers
- Use `.env.local` for local development (gitignored)
- Reference `.env.example` for required variables
- Use development/sandbox credentials only
- Never share production credentials

---

## Security Expectations

### For Contributors
- Do not commit secrets, API keys, or credentials
- Do not bypass branch protection rules
- Report any security concerns immediately
- Follow the principle of least privilege
- Validate all user inputs
- Use parameterized queries (Supabase handles this)

### For Vulnerability Reporters
- Do not publicly disclose until a fix is released
- Do not access or modify data beyond what's necessary to demonstrate the vulnerability
- Do not perform denial of service attacks
- Do not social engineer team members

---

## Compliance Considerations

As a telemedicine platform handling health data in Egypt:

| Requirement | Implementation |
|-------------|----------------|
| Data Privacy | Patient data encrypted at rest (Supabase) |
| Access Logging | Database audit trails |
| Session Security | Secure session handling, timeouts |
| Data Minimization | Only collect necessary information |

---

## Security Contacts

- **Primary**: Repository owner (@northshoremn)
- **Method**: GitHub Security Advisories (preferred)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-02 | Added GitHub Pro security features |
| 2026-02-02 | Enabled branch protection and rulesets |
| 2026-02-02 | Enabled Dependabot security updates |
