# Plan 1: Package Upgrades

## Overview
This plan outlines a **conservative approach** to upgrading DocuChat's dependencies, prioritizing stability and thorough testing.

## Current State
Based on `npm outdated`, there are **28 packages** requiring updates.

---

## Phase A: Safe Minor/Patch Updates (Low Risk)

These packages can be upgraded immediately with `npm update`:

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| @clerk/nextjs | 6.21.0 | 6.36.10 | Auth improvements |
| @eslint/eslintrc | 3.3.1 | 3.3.3 | Bug fixes |
| @neondatabase/serverless | 1.0.1 | 1.0.2 | Bug fixes |
| @radix-ui/react-dialog | 1.1.14 | 1.1.15 | UI fixes |
| @radix-ui/react-slot | 1.2.3 | 1.2.4 | Bug fixes |
| @tailwindcss/postcss | 4.1.8 | 4.1.18 | CSS improvements |
| @types/react | 19.1.6 | 19.2.9 | Type updates |
| @types/react-dom | 19.1.6 | 19.2.3 | Type updates |
| @uploadthing/react | 7.3.1 | 7.3.3 | Bug fixes |
| core-ts-utils | 1.1.0 | 1.2.0 | Minor features |
| eslint | 9.28.0 | 9.39.2 | Linting improvements |
| lucide-react | 0.513.0 | 0.563.0 | New icons |
| react | 19.1.0 | 19.2.3 | Performance fixes |
| react-dom | 19.1.0 | 19.2.3 | Performance fixes |
| sonner | 2.0.5 | 2.0.7 | Bug fixes |
| tailwind-merge | 3.3.0 | 3.4.0 | Utility improvements |
| tailwindcss | 4.1.8 | 4.1.18 | CSS features |
| tw-animate-css | 1.3.4 | 1.4.0 | Animation additions |
| typescript | 5.8.3 | 5.9.3 | Type improvements |
| uploadthing | 7.7.2 | 7.7.4 | Bug fixes |

### Commands
```bash
# Create backup branch first
git checkout -b pre-upgrade-backup
git checkout master

# Run safe updates
npm update

# Verify
npm test
npm run build
```

---

## Phase B: Major Version Updates (Breaking Changes)

These require careful migration, **one at a time**:

### 1. Next.js 16 + eslint-config-next 16

| Package | Current | Target |
|---------|---------|--------|
| next | 15.3.3 | 16.1.4 |
| eslint-config-next | 15.3.3 | 16.1.4 |

**Potential Breaking Changes:**
- New App Router features
- Updated server actions API
- React 19.2 required (done in Phase A)

**Migration Steps:**
```bash
npm install next@16 eslint-config-next@16
npm test
npm run build
```

**Files to Check:**
- `next.config.ts` - Configuration changes
- `app/layout.tsx` - Root layout updates
- `middleware.ts` - Middleware API changes

---

### 2. LangChain 1.x

| Package | Current | Target |
|---------|---------|--------|
| @langchain/core | 0.3.57 | 1.1.17 |
| @langchain/community | 0.3.45 | 1.1.7 |

**Potential Breaking Changes:**
- Major API restructure
- New import paths
- Updated model interfaces

**Note:** This can be skipped if switching to Claude (Plan 2), as we'll remove LangChain dependency entirely.

**Migration Steps:**
```bash
npm install @langchain/core@1 @langchain/community@1
```

**Files to Modify:**
- `lib/langchain.ts` - Update imports and API calls
- `lib/openai.ts` - Update LangChain integration
- `actions/upload-actions.ts` - Update PDF processing

---

### 3. Stripe 20

| Package | Current | Target |
|---------|---------|--------|
| stripe | 18.2.1 | 20.2.0 |

**Potential Breaking Changes:**
- API version updates
- Type changes
- Webhook signature changes

**Migration Steps:**
```bash
npm install stripe@20
```

**Files to Modify:**
- `lib/payments.ts` - Update Stripe client initialization
- `app/api/payments/route.ts` - Update webhook handler
- `utils/contants.ts` - Verify price IDs still work

---

### 4. Zod 4

| Package | Current | Target |
|---------|---------|--------|
| zod | 3.25.56 | 4.3.6 |

**Potential Breaking Changes:**
- Schema definition changes
- Validation behavior updates
- Error formatting changes

**Migration Steps:**
```bash
npm install zod@4
```

**Files to Modify:**
- `utils/uploadthing.ts` - File validation schemas
- `components/upload/upload-form.tsx` - Form validation
- Any other files using Zod schemas

---

### 5. pdf-parse 2.x

| Package | Current | Target |
|---------|---------|--------|
| pdf-parse | 1.1.1 | 2.4.5 |

**Potential Breaking Changes:**
- API changes for PDF parsing
- Different return format

**Migration Steps:**
```bash
npm install pdf-parse@2
```

**Files to Modify:**
- `lib/langchain.ts` - Update PDF loading logic
- `actions/upload-actions.ts` - Update extraction code

---

### 6. @types/node

| Package | Current | Target |
|---------|---------|--------|
| @types/node | 20.17.57 | 25.0.10 |

**Note:** Only upgrade if deploying to Node 25. For Vercel, check their Node version support first.

---

## Execution Checklist

- [ ] Create backup branch
- [ ] Phase A: Run `npm update` for safe packages
- [ ] Test: `npm test && npm run build`
- [ ] Phase B.1: Upgrade Next.js 16
- [ ] Test thoroughly
- [ ] Phase B.2: Upgrade LangChain 1.x (or skip if switching to Claude)
- [ ] Test thoroughly
- [ ] Phase B.3: Upgrade Stripe 20
- [ ] Test payment flows manually
- [ ] Phase B.4: Upgrade Zod 4
- [ ] Test form validations
- [ ] Phase B.5: Upgrade pdf-parse 2.x
- [ ] Test PDF uploads
- [ ] Final: Full regression test
- [ ] Deploy to preview environment
- [ ] Deploy to production

---

## Rollback Plan

If any upgrade causes issues:

```bash
# Revert to backup branch
git checkout pre-upgrade-backup

# Or revert specific package
npm install package-name@previous-version
```

---

## Verification

After each upgrade phase:

1. **Automated Tests:** `npm test`
2. **Build Check:** `npm run build`
3. **Manual Tests:**
   - Sign in/Sign up flow
   - Upload a PDF
   - View summary
   - Payment flow (use Stripe test mode)
   - Dashboard functionality
