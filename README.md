# MarqBid 🏠

**Mark it. Bid it. Sell it.**

A Next.js + Supabase + Vercel platform where homeowners post their intent to sell and realtors compete by bidding their commission rate. Includes a configurable minimum commission floor, state-level restriction enforcement, and Bridge Interactive property data integration.

---

## Quick start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free)
- A [GitHub](https://github.com) account

---

## 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/marqbid.git
cd marqbid
npm install
```

---

## 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it `marqbid`, choose a region close to your users
3. Once created, go to **SQL Editor** → paste and run the contents of:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

5. Go to **Authentication → Providers** → ensure **Email** is enabled

---

## 3. Set up Bridge Interactive API (free property data)

1. Go to [bridgeinteractive.com/developers](https://bridgeinteractive.com/developers/)
2. Apply for a free API key — this is HUD-backed public data
3. Alternatively, apply at [api.gateway.attomdata.com](https://api.gateway.attomdata.com) for ATTOM's free tier
4. Add your token as `BRIDGE_API_TOKEN` in your env file

> **Note:** If you don't have a Bridge token yet, the app gracefully falls back to manual price entry. You can launch without it.

---

## 4. Set up Stripe (listing fee payments)

1. Create a free account at [stripe.com](https://stripe.com)
2. Go to Developers → API keys
3. Copy your test keys:
   - `pk_test_...` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `sk_test_...` → `STRIPE_SECRET_KEY`
4. Set up a webhook at `https://yourdomain.com/api/stripe-webhook`
   - Event: `checkout.session.completed`
   - Copy the webhook secret → `STRIPE_WEBHOOK_SECRET`

---

## 5. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

BRIDGE_API_TOKEN=your-bridge-token
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Platform configuration (adjust as needed)
NEXT_PUBLIC_LISTING_FEE_CENTS=999          # $9.99
NEXT_PUBLIC_MIN_COMMISSION_PCT=1.2         # 1.2% floor
NEXT_PUBLIC_PLATFORM_NAME=MarqBid
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 7. Deploy to Vercel

### Option A — Vercel CLI (recommended)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B — GitHub integration
1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Add all environment variables under **Project Settings → Environment Variables**
5. Deploy — Vercel auto-deploys on every push to `main`

---

## 8. Connect your domain

1. Buy a domain (recommended: Namecheap, Google Domains, Cloudflare)
   - Suggestions: `BidMyAgent.com`, `AgentBid.com`, `MarqBid.com`, `ListAndBid.com`
2. In Vercel: **Project → Settings → Domains** → Add your domain
3. Follow Vercel's DNS instructions (usually add an A record pointing to Vercel's IP)
4. Update `NEXT_PUBLIC_SITE_URL` with your real domain
5. Update Supabase: **Authentication → URL Configuration** → add your domain to allowed URLs

---

## Architecture

```
marqbid/
├── app/
│   ├── page.tsx                    # Marketing homepage
│   ├── list/page.tsx               # Homeowner listing flow (4-step wizard)
│   ├── dashboard/page.tsx          # Homeowner dashboard + bid management
│   ├── listings/
│   │   ├── page.tsx                # Browse all active listings
│   │   └── [id]/page.tsx           # Individual listing detail
│   ├── realtor/page.tsx            # Realtor portal — browse & bid
│   ├── auth/login/page.tsx         # Login + signup (homeowner & realtor)
│   └── api/
│       ├── listings/route.ts       # GET (browse) / POST (create)
│       ├── bids/route.ts           # POST (place bid) / PUT (accept bid)
│       └── property-lookup/route.ts # Address → estimate + state check
├── lib/
│   ├── supabase/client.ts          # Browser Supabase client
│   ├── supabase/server.ts          # Server Supabase client
│   ├── state-disclosures.ts        # State restriction data (all 50 states)
│   └── property-lookup.ts          # Bridge / ATTOM API integration
├── types/index.ts                  # TypeScript types
├── supabase/migrations/
│   └── 001_initial_schema.sql      # Full database schema + RLS policies
├── middleware.ts                   # Auth protection
└── vercel.json                     # Deployment config
```

---

## Key platform settings

All configurable via environment variables:

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_LISTING_FEE_CENTS` | `999` | $9.99 listing fee |
| `NEXT_PUBLIC_MIN_COMMISSION_PCT` | `1.2` | 1.2% commission floor |
| `NEXT_PUBLIC_PLATFORM_NAME` | `MarqBid` | Your brand name |

---

## State restrictions

The app enforces state-level restrictions in `lib/state-disclosures.ts`. Currently:

- **Blocked:** KS, OK, WV (pending legal review)
- **Attorney disclosure required:** NY, GA, SC, NC, MA, CT, DE, MD, NJ, PA, RI, VT, NH, ME, LA
- **Disclosure required:** TX, FL, CA, CO, IL, WA, OR, VA, MI, MN, OH, WI, and others

> ⚠️ **Important:** Always consult a licensed real estate attorney before launching in any state. Real estate law changes frequently.

---

## Revenue model options

| Model | Implementation |
|---|---|
| **Listing fee** (current) | $9.99 per homeowner listing via Stripe |
| **Realtor acceptance fee** | Charge realtors $299–$499 when their bid is accepted (add Stripe Connect) |
| **Monthly realtor subscription** | Realtors pay to access listings (add subscription billing) |
| **Hybrid** | Small listing fee + realtor success fee |

---

## Roadmap

- [ ] Stripe payment integration (listing activation)
- [ ] Email notifications (new bids, bid accepted)
- [ ] Realtor license verification via state API
- [ ] Photo uploads (Supabase Storage)
- [ ] Saved searches & email alerts for realtors
- [ ] Review system post-sale
- [ ] Admin dashboard
- [ ] Mobile app (React Native)

---

## Legal disclaimer

MarqBid is not a licensed real estate broker or agent. This platform connects homeowners with licensed realtors. Always verify realtor credentials with your state's real estate commission. This codebase is provided as-is. Consult a real estate attorney before operating this platform commercially.
