# Thomas Web Studio

Service-based e-commerce platform built with Next.js, Prisma, Stripe, and Turso.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Prisma 7
- SQLite for local development
- Turso (libSQL) for deployed runtime
- Stripe Checkout + Webhooks
- Tailwind CSS

## Core Features

- Marketing landing page with service packages
- Authentication:
  - Single login for customers and admins
  - Role-based routing (`ADMIN` vs `CUSTOMER`)
- Customer area:
  - Account workspace
  - Profile page (email/password updates)
- Service cart:
  - Add/remove/update service quantities
  - Cart badge in navbar
- Payments:
  - Stripe Checkout from cart
  - Webhook updates order/payment status
- Admin:
  - Manage service packages
  - View service orders
  - Filter by order status (pending, delivered, cancelled)
  - Confirm kick-off call
  - Mark delivered
  - Cancel and archive
  - Global order intake toggle (open/closed)

## Project Structure

- `app/page.tsx`: public landing page
- `app/login/*`, `app/register/*`: auth pages and actions
- `app/account/*`: customer workspace/profile
- `app/admin/*`: admin console
- `app/cart/page.tsx`: service cart
- `app/actions/*`: server actions (cart, Stripe checkout)
- `app/api/stripe/webhook/route.ts`: Stripe webhook endpoint
- `prisma/schema.prisma`: data model
- `prisma/migrations/*`: SQL migrations

## Environment Variables

Set these in `.env` locally and in Vercel where applicable.

```env
# Local Prisma CLI schema URL (kept as sqlite for prisma generate/migrations locally)
DATABASE_URL="file:./dev.db"

# Turso runtime
TURSO_DATABASE_URL="libsql://<db-name>-<org>.turso.io"
TURSO_AUTH_TOKEN="<turso-token>"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Local Development

1. Install dependencies

```bash
bun install
```

2. Run migrations locally

```bash
bunx prisma migrate dev
```

3. Start dev server

```bash
bun run dev
```

4. Optional: open Prisma Studio

```bash
bunx --bun prisma studio
```

## Stripe Local Testing

1. Install Stripe CLI and login.
2. Start webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

3. Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`, then restart dev server.
4. Use Stripe test card:
   - `4242 4242 4242 4242`
   - any future expiry, any CVC, any postcode

## Turso and Production Migrations

This project uses Prisma with a libSQL adapter at runtime.  
Prisma CLI config is intentionally sqlite-based for local generation and migration creation.

When deploying schema changes, apply migration SQL files to Turso:

```bash
turso db list

DB_NAME="<exact-db-name-from-turso-db-list>"
for f in prisma/migrations/*/migration.sql; do
  echo "Applying $f"
  turso db shell "$DB_NAME" < "$f"
done
```

Then redeploy on Vercel.

## Deployment (Vercel)

Required Vercel env vars:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

Set Stripe webhook endpoint to:

```txt
https://<your-domain>/api/stripe/webhook
```

Listen for:

- `checkout.session.completed`

## Notes

- Do not commit runtime DB files (`*.db`, `*.sqlite`, journal/wal/shm files).
- Commit Prisma schema and migration files.
- If order/cart features appear unavailable in production, first verify that latest migrations were applied to Turso.
