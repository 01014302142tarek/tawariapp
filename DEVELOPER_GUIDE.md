# TawariApp Developer Guide

Welcome to the TawariApp development team! This guide covers our workflow, branching conventions, and contribution process.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/northshoremn/tawariapp.git
cd tawariapp
npm install
```

### 2. Set Up Environment

Copy the example environment file and fill in your **development** credentials:

```bash
cp .env.example .env.local
```

> **Important**: Never commit `.env.local` or any file containing real credentials.

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Branch Naming Convention

We enforce strict branch naming. You can **only** create branches with these prefixes:

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feature/` | New functionality | `feature/video-call-ui` |
| `fix/` | Bug fixes | `fix/login-timeout` |
| `hotfix/` | Urgent production fixes | `hotfix/payment-crash` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `refactor/` | Code improvements | `refactor/auth-logic` |

### Naming Tips

- Use lowercase and hyphens: `feature/add-patient-search` (not `Feature/AddPatientSearch`)
- Be descriptive but concise: `fix/doctor-availability-sync` (not `fix/bug`)
- Reference ticket numbers if applicable: `feature/TAW-123-video-calls`

---

## Development Workflow

### Step 1: Start Fresh from Main

Always start your work from the latest `main` branch:

```bash
git checkout main
git pull origin main
```

### Step 2: Create Your Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Step 3: Make Your Changes

- Write clean, readable code
- Follow existing code patterns
- Test your changes locally
- Run linting before committing:

```bash
npm run lint
```

### Step 4: Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "Add video call button to consultation page"
```

**Good commit messages:**
- `Add patient search functionality`
- `Fix doctor availability not syncing`
- `Update dependencies to latest versions`

**Bad commit messages:**
- `fix`
- `wip`
- `changes`

### Step 5: Push and Create Pull Request

```bash
git push -u origin feature/your-feature-name
```

Then create a PR using GitHub CLI or the web interface:

```bash
gh pr create --title "Add video call button" --body "Description of changes..."
```

Or go to: https://github.com/northshoremn/tawariapp/pulls

### Step 6: Code Review

- All PRs require **approval from the code owner** before merging
- Address any review comments
- Keep your branch updated with main if needed:

```bash
git checkout main
git pull origin main
git checkout feature/your-feature-name
git merge main
```

### Step 7: After Merge

Once your PR is approved and merged:

```bash
git checkout main
git pull origin main
git branch -d feature/your-feature-name  # Delete local branch
```

---

## Protected Branches

| Branch | Purpose | Who Can Push |
|--------|---------|--------------|
| `main` | Production code | No one (PR only) |
| `staging` | Testing/QA | No one (PR only) |

**You cannot:**
- Push directly to `main` or `staging`
- Force push to any protected branch
- Delete protected branches
- Create/delete release tags (`v*`)

---

## Pull Request Guidelines

### Before Creating a PR

- [ ] Code runs without errors locally
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Changes are tested manually
- [ ] No console.log statements left in code
- [ ] No commented-out code
- [ ] No hardcoded credentials or API keys

### PR Description Template

```markdown
## Summary
Brief description of what this PR does.

## Changes
- Change 1
- Change 2

## Testing
How to test these changes:
1. Step 1
2. Step 2

## Screenshots (if UI changes)
Add screenshots here.
```

---

## Code Style

### TypeScript

- Use strict TypeScript (`strict: true` is enabled)
- Define types for all function parameters and return values
- Avoid `any` type - use `unknown` if type is truly unknown

### React

- Use functional components with hooks
- Use Server Components where possible (no `"use client"` unless needed)
- Keep components small and focused

### Styling

- Use Tailwind CSS classes
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Support RTL layouts (Arabic)

### File Structure

```
app/
├── [lang]/           # Locale-prefixed routes
│   ├── page.tsx     # Landing page
│   └── dashboard/   # Dashboard pages
components/
├── ui/              # Reusable UI components
lib/
├── utils.ts         # Utility functions
```

---

## Environment Variables

**Never commit real credentials.** Use environment variables:

| Variable | Description | Who Has Access |
|----------|-------------|----------------|
| `SUPABASE_URL` | Database URL | Admin only (production) |
| `SUPABASE_ANON_KEY` | Public API key | All developers |
| `DAILY_API_KEY` | Video call API | Admin only (production) |

For development, use the shared development Supabase project credentials.

---

## Getting Help

- **Code questions**: Ask in the team chat
- **Git issues**: Ask the team lead
- **Bug reports**: Create a GitHub issue

---

## Quick Reference

```bash
# Start fresh
git checkout main && git pull

# Create feature branch
git checkout -b feature/my-feature

# Check status
git status

# Stage and commit
git add . && git commit -m "Your message"

# Push and create PR
git push -u origin feature/my-feature
gh pr create

# After merge, clean up
git checkout main && git pull && git branch -d feature/my-feature
```

---

Happy coding!
