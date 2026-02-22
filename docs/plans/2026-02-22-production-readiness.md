# Production Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring `vibegeorgia.com` to production-ready security, stability, and operability without breaking working public flows.

**Architecture:** Keep public endpoints and current user paths stable, add safe compatibility layers for admin/auth migration, and roll out in small verifiable slices. Backend-first deployment for contract changes, then frontend switchovers. Every step includes rollback-safe behavior and explicit verification.

**Tech Stack:** Next.js 16, React 19, NestJS 11, Prisma, PostgreSQL, Cloudinary, Docker

---

### Task 1: Baseline and Release Guardrails

**Files:**
- Create: `.gitignore`
- Modify: `tourism-backend/.gitignore`
- Create: `.github/workflows/ci.yml`
- Create: `docs/release/smoke-checklist.md`

**Step 1: Write failing CI checks**

Define CI to run install/lint/test/build for both apps on clean machine.

**Step 2: Run CI locally equivalent**

Run: 
```bash
cd nextjs-frontend && npm ci && npm run lint && npm run build
cd ../tourism-backend && npm ci && npm run lint && npm test -- --runInBand
```
Expected: initial failures identify missing dependencies/config issues.

**Step 3: Minimal implementation**

Add root `.gitignore` and fix malformed `tourism-backend/.gitignore`; add CI workflow and smoke checklist.

**Step 4: Re-run local checks**

Run same commands and confirm reproducible baseline.

**Step 5: Commit**

```bash
git add .gitignore tourism-backend/.gitignore .github/workflows/ci.yml docs/release/smoke-checklist.md
git commit -m "chore: add baseline ci and repository hygiene guards"
```

### Task 2: Close Public Admin Registration and Secret Fallbacks

**Files:**
- Modify: `tourism-backend/src/auth/auth.controller.ts`
- Modify: `tourism-backend/src/auth/auth.module.ts`
- Modify: `tourism-backend/src/auth/strategies/jwt.strategy.ts`
- Modify: `tourism-backend/src/main.ts`
- Create: `tourism-backend/test/auth-security.e2e-spec.ts`

**Step 1: Write failing tests**

Add tests for:
- `POST /auth/register` is disabled in production mode.
- App fails fast when `JWT_SECRET` missing in production.

**Step 2: Run tests to verify failure**

Run:
```bash
cd tourism-backend && npm run test:e2e -- --runInBand
```
Expected: tests fail before implementation.

**Step 3: Minimal implementation**

- Gate or remove public register endpoint.
- Replace `process.env.JWT_SECRET || 'your-secret-key'` with strict config validation.
- Keep login behavior unchanged.

**Step 4: Re-run tests**

Run same e2e command and ensure pass.

**Step 5: Commit**

```bash
git add tourism-backend/src/auth/auth.controller.ts tourism-backend/src/auth/auth.module.ts tourism-backend/src/auth/strategies/jwt.strategy.ts tourism-backend/src/main.ts tourism-backend/test/auth-security.e2e-spec.ts
git commit -m "fix(auth): disable public register and enforce jwt secret"
```

### Task 3: Safe Auth Migration to HttpOnly Cookies (Backward Compatible)

**Files:**
- Modify: `tourism-backend/src/auth/auth.controller.ts`
- Modify: `tourism-backend/src/auth/auth.service.ts`
- Modify: `nextjs-frontend/lib/api.ts`
- Modify: `nextjs-frontend/app/[locale]/admin/login/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/admin/layout.tsx`
- Create: `tourism-backend/test/auth-cookie.e2e-spec.ts`

**Step 1: Write failing tests**

Add e2e tests asserting login returns `Set-Cookie` with `HttpOnly`, `SameSite`, `Secure` (prod), while still returning token payload during transition.

**Step 2: Run tests to verify failure**

Run:
```bash
cd tourism-backend && npm run test:e2e -- --runInBand
```
Expected: cookie contract test fails.

**Step 3: Minimal implementation**

- Backend sets auth cookie on login.
- Frontend moves away from writing token cookie via JS.
- Keep `Authorization` header support temporarily (one release) for no-break migration.

**Step 4: Re-run backend + frontend checks**

Run:
```bash
cd tourism-backend && npm run test:e2e -- --runInBand
cd ../nextjs-frontend && npm run lint && npm run build
```
Expected: pass.

**Step 5: Commit**

```bash
git add tourism-backend/src/auth/auth.controller.ts tourism-backend/src/auth/auth.service.ts nextjs-frontend/lib/api.ts nextjs-frontend/app/[locale]/admin/login/page.tsx nextjs-frontend/app/[locale]/admin/layout.tsx tourism-backend/test/auth-cookie.e2e-spec.ts
git commit -m "feat(auth): migrate to httpOnly cookies with compatibility layer"
```

### Task 4: Admin Tours Contract Fix Without Breaking Public Tours

**Files:**
- Modify: `tourism-backend/src/tours/tours.controller.ts`
- Modify: `tourism-backend/src/tours/tours.service.ts`
- Modify: `nextjs-frontend/app/[locale]/admin/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/admin/tours/page.tsx`
- Create: `tourism-backend/test/admin-tours.e2e-spec.ts`

**Step 1: Write failing tests**

Add test proving admin list endpoint returns active + inactive tours, while `/tours` remains public active-only.

**Step 2: Run tests to verify failure**

Run:
```bash
cd tourism-backend && npm run test:e2e -- --runInBand
```
Expected: fail before endpoint exists.

**Step 3: Minimal implementation**

- Add `/admin/tours` endpoint for full list.
- Keep `/tours` unchanged.
- Frontend admin pages switch to `/admin/tours` and use `status` field, not `isActive`.

**Step 4: Re-run tests/build**

Run:
```bash
cd tourism-backend && npm run test:e2e -- --runInBand
cd ../nextjs-frontend && npm run build
```
Expected: pass.

**Step 5: Commit**

```bash
git add tourism-backend/src/tours/tours.controller.ts tourism-backend/src/tours/tours.service.ts nextjs-frontend/app/[locale]/admin/page.tsx nextjs-frontend/app/[locale]/admin/tours/page.tsx tourism-backend/test/admin-tours.e2e-spec.ts
git commit -m "fix(admin): add full tours endpoint and align status contract"
```

### Task 5: Blog Publish Timestamp Correctness

**Files:**
- Modify: `tourism-backend/src/blog/blog.service.ts`
- Create: `tourism-backend/test/blog-publish.e2e-spec.ts`

**Step 1: Write failing test**

Test that editing published post without publish-state change does not reset `publishedAt`.

**Step 2: Run test to verify failure**

Run:
```bash
cd tourism-backend && npm run test:e2e -- --runInBand
```
Expected: fail on timestamp mutation.

**Step 3: Minimal implementation**

Update `publishedAt` only when state changes draft->published; preserve existing value otherwise.

**Step 4: Re-run tests**

Run same e2e command and ensure pass.

**Step 5: Commit**

```bash
git add tourism-backend/src/blog/blog.service.ts tourism-backend/test/blog-publish.e2e-spec.ts
git commit -m "fix(blog): preserve publishedAt on non-state edits"
```

### Task 6: Locale-Safe Navigation and UX Accuracy

**Files:**
- Modify: `nextjs-frontend/components/Footer.tsx`
- Modify: `nextjs-frontend/components/CookieBanner.tsx`
- Modify: `nextjs-frontend/app/[locale]/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/tours/page.tsx`

**Step 1: Write failing tests**

Add UI tests (or Playwright checks) for:
- Privacy/Terms links remain in active locale.
- Tour duration renders human-readable values.

**Step 2: Run tests to verify failure**

Run:
```bash
cd nextjs-frontend && npm run test
```
Expected: failures for locale links/duration formatting.

**Step 3: Minimal implementation**

- Make links locale-aware (`/${locale}/privacy`, `/${locale}/terms`).
- Normalize duration display (avoid raw `1` output).

**Step 4: Re-run tests/build**

Run:
```bash
cd nextjs-frontend && npm run lint && npm run build
```
Expected: pass.

**Step 5: Commit**

```bash
git add nextjs-frontend/components/Footer.tsx nextjs-frontend/components/CookieBanner.tsx nextjs-frontend/app/[locale]/page.tsx nextjs-frontend/app/[locale]/tours/page.tsx
git commit -m "fix(frontend): locale-safe legal links and duration formatting"
```

### Task 7: Production Content Policy (Mock Fallback Control)

**Files:**
- Modify: `nextjs-frontend/app/[locale]/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/blog/page.tsx`
- Modify: `nextjs-frontend/app/[locale]/blog/[slug]/page.tsx`
- Create: `nextjs-frontend/lib/content-policy.ts`

**Step 1: Write failing tests**

Test that production mode does not mix stale mock content into live blog feed when API is available.

**Step 2: Run tests to verify failure**

Run:
```bash
cd nextjs-frontend && npm run test
```
Expected: failing policy behavior.

**Step 3: Minimal implementation**

Introduce policy flag:
- `development`: allow mock fallback.
- `production`: API-first, controlled fallback only on hard failure (optionally empty-state).

**Step 4: Re-run tests/build**

Run:
```bash
cd nextjs-frontend && npm run lint && npm run build
```
Expected: pass.

**Step 5: Commit**

```bash
git add nextjs-frontend/app/[locale]/page.tsx nextjs-frontend/app/[locale]/blog/page.tsx nextjs-frontend/app/[locale]/blog/[slug]/page.tsx nextjs-frontend/lib/content-policy.ts
git commit -m "chore(content): control mock fallback policy by environment"
```

### Task 8: Secrets and Seed Hardening

**Files:**
- Modify: `tourism-backend/prisma/seed.ts`
- Modify: `tourism-backend/src/scripts/create-admin.ts`
- Modify: `tourism-backend/README.md`
- Create: `tourism-backend/.env.example`

**Step 1: Write failing checks**

Add script/check to fail if hardcoded credentials detected in tracked source.

**Step 2: Run check to verify failure**

Run:
```bash
rg -n "admin123|123Tatishvili|your-secret-key" tourism-backend
```
Expected: current matches found.

**Step 3: Minimal implementation**

Move credentials to environment-driven setup; remove hardcoded values from committed code/docs.

**Step 4: Re-run checks**

Run same `rg` command and ensure no hardcoded secrets remain.

**Step 5: Commit**

```bash
git add tourism-backend/prisma/seed.ts tourism-backend/src/scripts/create-admin.ts tourism-backend/README.md tourism-backend/.env.example
git commit -m "security: remove hardcoded admin credentials"
```

### Task 9: Staging Verification and Safe Production Rollout

**Files:**
- Modify: `docs/release/smoke-checklist.md`
- Create: `docs/release/rollback-plan.md`

**Step 1: Prepare staging deploy**

Deploy backend first, then frontend.

**Step 2: Run smoke checklist**

Validate:
- `/en`, `/en/tours`, `/en/blog`, `/en/privacy`, `/en/terms`
- `/en/admin/login` login flow
- admin create/edit/delete tour
- image upload/delete
- blog create/edit/publish

**Step 3: Validate monitoring/alerts**

Check 4xx/5xx rates, auth failures, and response latency.

**Step 4: Production deploy with rollback ready**

- Deploy backend.
- Verify backward compatibility.
- Deploy frontend.
- Execute post-deploy smoke tests.

**Step 5: Commit release docs**

```bash
git add docs/release/smoke-checklist.md docs/release/rollback-plan.md
git commit -m "docs: add rollout and rollback playbook"
```

## Release Order (No-Break Sequence)

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8
9. Task 9

## Hard Stop Gates (Do Not Proceed If Failed)

- CI red on baseline checks
- Auth e2e failing
- Admin tours contract mismatch
- Smoke checks failing on staging
- No rollback path validated
