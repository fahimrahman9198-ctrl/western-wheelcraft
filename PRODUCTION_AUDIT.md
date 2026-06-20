# Western Wheelcraft Production Audit

Date: 2026-06-19
Repository: https://github.com/fahimrahman9198-ctrl/western-wheelcraft
Vercel project: `western-wheelcraft`

## Executive Summary

Western Wheelcraft has moved from a sales prototype to a backend-enabled staging application. The application builds successfully and now has real Neon persistence, Clerk-protected admin routes, Vercel Blob upload code, Resend transactional email, and Neon-backed admin reporting.

It is not ready for final public launch. The principal blockers are pending production Blob testing, incomplete admin operations, no Stripe payment workflow, simulated AI assessment, a demo-oriented dealership portal, security/legal/SEO work, and custom-domain cutover.

## Verification Status

- `npm run lint`: passing as of 2026-06-19.
- `npx tsc --noEmit`: passing as of 2026-06-19.
- `npm run build`: passing as of 2026-06-19 with Next.js 16.2.6.
- `npm audit fix`: removed the fixable high-severity `undici` advisories.
- `npm audit --omit=dev`: reports two moderate transitive PostCSS advisories. npm's forced remedy would downgrade Next.js to 9.3.3, so it was not applied.
- Private Vercel Blob: production OIDC upload passed on 2026-06-19; direct unauthenticated access returned `403` and test records were removed.
- Vercel CLI: upgraded to 54.14.2.
- `.env.local`: ignored by Git.
- `.vercel`: ignored by Git.

## Implemented

### Database and persistence

- Neon Postgres connection and Drizzle configuration.
- Schema and migration foundation for customers, vehicles, quotes, quote photos, AI assessments, bookings, invoices, line items, payments, communications, admin users, settings, and webhook events.
- Contact-form leads persist as quote records.
- Quote-estimator submissions persist customer, vehicle, quote, pricing snapshot, and photo metadata.
- Booking requests persist customer and booking records.
- Admin business, pricing, and email-template settings persist to Neon.

### Authentication and authorization

- Clerk protects admin routes server-side through `src/proxy.ts` and protected layouts.
- Supported application roles are owner, manager, and accountant.
- Fake localStorage admin authentication is no longer the production access control.
- Unauthorized signed-in users receive an access-denied page.

### Admin dashboard

- Overview, leads, bookings, customers, invoices, analytics, and settings read Neon data.
- Invoice and export actions that are not implemented are disabled instead of claiming success.
- Quote photo counts and authenticated private thumbnails are available in admin leads.
- Integration cards distinguish implemented systems from pending systems.

### Email

- Resend is installed and wired through a server-only module.
- Contact, quote, and booking submissions attempt both admin and customer emails.
- Email failure does not roll back a successfully saved customer request.
- Accepted Resend messages are logged as outbound Neon communications.
- Google Workspace handles inbound mail for `info@westernwheelcraft.ca`.

### Customer flows

- Contact, quote, and booking requests save through server API routes.
- Quote estimator requires at least one validated image and supports up to eight images at 8 MB each.
- Quote and booking success pages use server-issued reference numbers.
- Primary checkout routes no longer collect fake card details.
- Stripe-pending pages honestly state that online payment is unavailable.

## Critical Launch Blockers

### 1. Stripe is not implemented

- No production 50 percent deposit flow.
- No Stripe Customer or saved payment-method workflow.
- No verified webhook endpoint or idempotent payment processing.
- No final 50 percent charge, refund, dispute, or failed-payment workflow.
- Invoice and payment tables exist but are not connected to Stripe events.

### 2. AI assessment is simulated

- The estimator still generates random damage classifications and percentages.
- No OpenAI API or Vercel AI Gateway integration exists.
- No deterministic owner-approved pricing policy is applied to real model output.
- AI results must be removed/disabled for launch or replaced with a reviewable production implementation.

### 3. Custom domain still points to the legacy host

- Authoritative nameservers are `ns1` through `ns4.mysecurecloudhost.com`.
- `westernwheelcraft.ca` currently resolves to legacy cPanel IP `192.250.237.73`.
- The custom domain is not currently attached to the Vercel project.
- Google Workspace MX and verification records must be preserved during website DNS cutover.

### 4. Production foundation requires merge review

- The production foundation and private Blob work are committed on `codex/production-foundation`.
- The branch requires review and merge into `main` before Git-connected production deployments use it automatically.

## High-Priority Remaining Work

- Run controlled production tests for contact, quote, booking, email, admin data, and Clerk roles.
- Add server-authorized admin mutations for lead/quote status, booking confirmation, notes, price override, invoice creation, and payment state.
- Disable or productionize the dealership portal, which still contains placeholder payment behavior.
- Add rate limiting, bot protection, upload abuse controls, security headers, and production logging.
- Confirm privacy, retention, cancellation, refund, photo consent, and marketing-consent policies.
- Verify all public business claims, certifications, warranty language, pricing, address, service regions, and turnaround promises.

## Medium-Priority Remaining Work

- Add sitemap, robots rules, canonical metadata, LocalBusiness structured data, social metadata, icons, and manifest assets.
- Optimize oversized image assets and run mobile/desktop performance checks.
- Add accessibility verification for keyboard navigation, form labels, contrast, focus, and alternative text.
- Add monitoring, spend controls, backup/restore validation, and launch rollback instructions.
- Remove obsolete demo-data modules after confirming no future development fixtures depend on them.
- Remove remaining localStorage payment utilities after the dealership portal is cleaned.

## Environment Status

Present locally and in Vercel production:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_NOTIFICATION_EMAIL`

Still required for later phases:

- `BLOB_STORE_ID` and Vercel OIDC are configured automatically for the connected private Blob store; `BLOB_READ_WRITE_TOKEN` is only a local fallback.
- `CLERK_WEBHOOK_SECRET` if Clerk user synchronization is implemented.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` for payments.
- `OPENAI_API_KEY` and `OPENAI_VISION_MODEL`, or equivalent Vercel AI Gateway configuration, for real AI assessment.

## Recommended Launch Order

1. Review and merge the production foundation branch.
2. Test all currently implemented customer and admin flows.
3. Add admin operational mutations.
4. Implement Stripe, or explicitly launch with manual payment only.
5. Replace or disable simulated AI.
6. Disable or productionize the dealership portal.
7. Complete security, legal, content, SEO, performance, and accessibility work.
8. Attach the custom domain to Vercel and update only website DNS records.
9. Run final production acceptance tests and owner sign-off.

## Current Readiness Verdict

- Backend-enabled staging: ready.
- Controlled internal testing: ready.
- Public marketing launch with manual payments: possible after Blob, security/content cleanup, testing, and DNS cutover.
- Full platform launch with payments and AI: not ready until Stripe and real AI phases are complete.
