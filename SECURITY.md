# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in TawariApp, please report it responsibly:

1. **Do NOT** create a public GitHub issue
2. Email the security concern to: admin@northshoredigital.dev
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

We will respond within 48 hours and work with you to resolve the issue.

## Security Measures

### Data Protection
- All patient data is encrypted in transit (HTTPS)
- Database access is controlled via Row Level Security (RLS)
- API keys and secrets are stored in environment variables, never in code

### Authentication
- User authentication via Supabase Auth
- Session tokens with secure expiration
- Role-based access control (patient, doctor, admin)

### Code Security
- Dependabot monitors for vulnerable dependencies
- GitHub secret scanning prevents credential leaks
- Required code review before merging to main

## Sensitive Areas

The following areas handle sensitive data and require extra care:
- `/app/actions/prescriptions.ts` - Medical prescriptions
- `/app/actions/appointments.ts` - Patient-doctor appointments
- `/app/actions/auth*` - Authentication logic
- `/lib/supabase/` - Database access layer
- `/app/[lang]/checkout/` - Payment processing
