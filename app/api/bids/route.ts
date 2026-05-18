// app/api/bids/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { commissionPctToUsd } from '@/lib/property-lookup';

// POST /api/bids — realtor places a bid
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify realtor role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, license_number, license_state')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'realtor') {
    return NextResponse.json({ error: 'Only realtors can place bids' }, { status: 403 });
  }

  const body = await req.json();
  const { listing_id, bid_type, commission_pct, commission_usd_flat, cover_letter } = body;

  // Fetch listing to validate
  const { data: listing } = await supabase
    .from('listings')
    .select('status, reference_price, min_commission_usd, min_commission_pct, state, bid_deadline')
    .eq('id', listing_id)
    .single();

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  if (listing.status !== 'active') {
    return NextResponse.json({ error: 'Listing is not accepting bids' }, { status: 400 });
  }

  if (new Date(listing.bid_deadline) < new Date()) {
    return NextResponse.json({ error: 'Bidding has closed for this listing' }, { status: 400 });
  }

  // Verify realtor is licensed in the listing state
  if (profile.license_state && profile.license_state !== listing.state) {
    return NextResponse.json({
      error: `Your license is for ${profile.license_state}, but this property is in ${listing.state}. Many states require local licensure.`
    }, { status: 403 });
  }

  // Calculate USD amount
  let commissionUsd: number;
  if (bid_type === 'percentage') {
    if (!commission_pct || commission_pct <= 0) {
      return NextResponse.json({ error: 'commission_pct required for percentage bids' }, { status: 400 });
    }
    commissionUsd = commissionPctToUsd(listing.reference_price, commission_pct);
  } else {
    commissionUsd = commission_usd_flat;
  }

  // Enforce minimum floor
  if (commissionUsd < listing.min_commission_usd) {
    return NextResponse.json({
      error: `Bid of $${commissionUsd.toLocaleString()} is below the minimum commission floor of $${listing.min_commission_usd.toLocaleString()} (${listing.min_commission_pct}%)`,
    }, { status: 400 });
  }

  const { data: bid, error } = await supabase
    .from('bids')
    .upsert({
      listing_id,
      realtor_id: user.id,
      bid_type,
      commission_pct: bid_type === 'percentage' ? commission_pct : null,
      commission_usd: commissionUsd,
      cover_letter,
      status: 'pending',
    }, { onConflict: 'listing_id,realtor_id' })  // update existing bid if re-bidding
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bid }, { status: 201 });
}

// POST /api/bids/accept — homeowner accepts a bid
export async function PUT(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { bid_id, listing_id } = body;

  const { error } = await supabase.rpc('accept_bid', {
    p_bid_id: bid_id,
    p_listing_id: listing_id,
    p_owner_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
