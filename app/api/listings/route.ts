// app/api/listings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isStateAllowed } from '@/lib/state-disclosures';
import { calculateMinCommission } from '@/lib/property-lookup';

// GET /api/listings — list active listings with optional filters
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const state = searchParams.get('state');
  const minBeds = searchParams.get('min_beds');
  const maxPrice = searchParams.get('max_price');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  let query = supabase
    .from('listings')
    .select(`
      *,
      profile:profiles(id, full_name, avg_rating),
      bid_count:bids(count),
      lowest_bid:bids(commission_usd)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (state) query = query.eq('state', state.toUpperCase());
  if (minBeds) query = query.gte('bedrooms', parseInt(minBeds));
  if (maxPrice) query = query.lte('reference_price', parseInt(maxPrice));

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listings: data, total: count, page });
}

// POST /api/listings — create new listing
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    address, city, state, zip,
    bedrooms, bathrooms, sqft, year_built,
    description, asking_price, zestimate,
    bid_deadline_days = 7,
    min_commission_pct,
  } = body;

  // Validate state
  if (!isStateAllowed(state?.toUpperCase())) {
    return NextResponse.json(
      { error: `Listings from ${state} are currently not accepted` },
      { status: 403 }
    );
  }

  // Calculate reference price and min commission
  const referencePrice = Math.max(
    asking_price || 0,
    zestimate || 0
  );

  if (referencePrice <= 0) {
    return NextResponse.json(
      { error: 'A valid asking price or property estimate is required' },
      { status: 400 }
    );
  }

  const platformMinPct = parseFloat(process.env.NEXT_PUBLIC_MIN_COMMISSION_PCT || '1.2');
  const effectiveMinPct = min_commission_pct
    ? Math.max(min_commission_pct, platformMinPct)
    : platformMinPct;

  const minCommission = calculateMinCommission(referencePrice, effectiveMinPct);

  const bidDeadline = new Date();
  bidDeadline.setDate(bidDeadline.getDate() + Math.min(bid_deadline_days, 30));

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      owner_id: user.id,
      address, city,
      state: state.toUpperCase(),
      zip,
      bedrooms, bathrooms, sqft, year_built,
      description,
      asking_price,
      zestimate,
      reference_price: referencePrice,
      min_commission_pct: effectiveMinPct,
      min_commission_usd: minCommission.usd,
      bid_deadline: bidDeadline.toISOString(),
      listing_fee_cents: parseInt(process.env.NEXT_PUBLIC_LISTING_FEE_CENTS || '999'),
      status: 'draft', // activated after payment
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ listing }, { status: 201 });
}
