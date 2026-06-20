# Western Wheelcraft

Production-oriented Next.js application for Western Wheelcraft, a wheel refinishing and curb-rash repair business in British Columbia.

**Live:** https://western-wheelcraft.vercel.app

The original sales prototype has been upgraded with Neon persistence, Clerk-protected administration, Vercel Blob photo support, Resend transactional email, and fixed wheel pricing. Stripe payments, real AI damage analysis, final security hardening, and custom-domain cutover remain pre-launch work. See `PRODUCTION_AUDIT.md` for the current readiness assessment.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS v3
- Neon Postgres and Drizzle ORM
- Clerk authentication
- Vercel and Vercel Blob
- Resend transactional email
- Planned: Stripe payments and OpenAI Vision

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. Never commit `.env.local` or paste production credentials into source files.

## Scripts

```bash
npm run dev          # Start local development
npm run lint         # Run ESLint
npx tsc --noEmit     # Run TypeScript checks
npm run build        # Build the production application
npm start            # Start the production build
npm run db:check     # Verify database connectivity
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Apply Drizzle migrations
npm run db:studio    # Open Drizzle Studio
```

## Implemented Production Systems

- Contact, quote, customer, vehicle, booking, photo metadata, invoice, payment, communication, and admin-settings schemas in Neon.
- Real contact, quote, photo, and booking persistence through App Router API routes.
- Clerk server-side protection for `/admin` with owner, manager, and accountant roles.
- Neon-backed admin overview, leads, bookings, customers, invoices, analytics, and settings.
- Admin lead and booking workflow controls persist status, schedule, and price changes with an audit trail.
- Owner, manager, and accountant roles have equal access to operational and pricing controls.
- Admin users can add internal customer, quote, and booking notes.
- Resend admin notifications and customer confirmations for contact, quote, and booking submissions.
- Quote photos upload to private Vercel Blob storage and are delivered through authenticated admin routes.
- Customer success pages use server-issued quote and booking numbers.
- Fixed wheel pricing model: $250 per wheel, -$100 bulk discount for 4+ wheels, +5% GST.
- Simplified quote estimator: wheel count selector replaces AI damage analysis; final pricing confirmed by technician.
- Fake card collection and demo payment processing removed from the primary customer flows.

## Pricing (Current MVP Phase)

Fixed pricing model while awaiting Stripe setup and client business details:
- **$250 per wheel** (base price)
- **-$100 for 4+ wheels** (bulk discount)
- **+5% GST** (automatic calculation)

Example: 4 wheels = $1,000 - $100 + $45 GST = **$945 CAD**

This is a reference quote; final pricing is confirmed by the technician after review. Stripe payment processing will be added post-launch once Stripe keys are provided.

## Remaining Launch Work

- Complete production smoke testing for contact, quote, booking, email, photos, and admin roles.
- Add rate limiting and bot protection to public APIs.
- Add security headers and HTTPS/CSP configuration.
- Disable or productionize the dealership portal.
- Implement Stripe deposit, saved payment method, final charge, and verified webhooks.
- Replace or disable AI damage assessment (currently disabled for MVP).
- Add legal policies, verify business claims, SEO assets, and performance optimization.
- Attach `westernwheelcraft.ca` to Vercel and update DNS records (preserve Google Workspace mail).

## Environment Variables

`.env.example` is the source of truth. Production values belong in Vercel project environment settings.

Currently required for implemented core flows:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_NOTIFICATION_EMAIL`
- `BLOB_STORE_ID` with Vercel OIDC for production quote photo uploads
- `BLOB_READ_WRITE_TOKEN` only as an optional local-development fallback

Stripe and OpenAI variables are intentionally optional until those features are implemented.

## Deployment

**Live:** https://western-wheelcraft.vercel.app

The Vercel project is `western-wheelcraft`. Production deployments currently use the Vercel-provided domain; the public custom domain still points to the legacy cPanel host.

### Pre-Deployment Checklist

```bash
npm run lint                  # Lint check
npx tsc --noEmit            # TypeScript check
npm run build               # Production build
npm audit --omit=dev        # Dependency audit
npx vercel deploy --prod    # Deploy to production
```

### Environment Variables (Vercel Production)

All required variables are configured:
- `DATABASE_URL` (Neon connection)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`
- `BLOB_STORE_ID`, `BLOB_WEBHOOK_PUBLIC_KEY`

Use a Vercel plan permitted for commercial production, set spend controls, and verify all environment variables before domain cutover.

### Post-Launch Phases

Once the client provides:
- **Stripe keys** → Phase 5: Implement payment processing
- **Business details** → Update company info, service regions, pricing confirmation
- **Custom domain DNS** → Phase 8: Attach `westernwheelcraft.ca` and migrate DNS
