# Western Wheelcraft

Production-oriented Next.js application for Western Wheelcraft, a wheel refinishing and curb-rash repair business in British Columbia.

The original sales prototype has been upgraded with Neon persistence, Clerk-protected administration, Vercel Blob photo support, and Resend transactional email. Stripe payments, real AI damage analysis, final security hardening, and custom-domain cutover remain pre-launch work. See `PRODUCTION_AUDIT.md` for the current readiness assessment.

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
- Resend admin notifications and customer confirmations for contact, quote, and booking submissions.
- Quote photos uploaded to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is configured.
- Customer success pages use server-issued quote and booking numbers.
- Fake card collection and demo payment processing removed from the primary customer flows.

## Remaining Launch Work

- Configure Vercel Blob locally and in Vercel production, then test private photo access.
- Complete production smoke testing for contact, quote, booking, email, photos, and admin roles.
- Add real admin mutation workflows for statuses, assignments, notes, quote approval, and invoices.
- Implement Stripe deposit, saved payment method, final charge, and verified webhooks.
- Replace the simulated AI damage assessment with a real provider or disable it for launch.
- Disable or productionize the dealership portal.
- Add rate limiting, bot protection, legal policies, verified business claims, SEO assets, and performance work.
- Attach `westernwheelcraft.ca` to Vercel and change only the website DNS records while preserving Google Workspace mail records.

## Environment Variables

`.env.example` is the source of truth. Production values belong in Vercel project environment settings.

Currently required for implemented core flows:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_NOTIFICATION_EMAIL`
- `BLOB_READ_WRITE_TOKEN` for quote photo uploads

Stripe and OpenAI variables are intentionally optional until those features are implemented.

## Deployment

The Vercel project is `western-wheelcraft`. Production deployments currently use the Vercel-provided domain; the public custom domain still points to the legacy cPanel host.

Before deployment:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

Use a Vercel plan permitted for commercial production, set spend controls, and verify all required production environment variables before domain cutover.
