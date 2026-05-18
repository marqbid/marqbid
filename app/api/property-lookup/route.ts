// app/api/property-lookup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { lookupPropertyEstimate, calculateMinCommission } from '@/lib/property-lookup';
import { isStateAllowed, getStateDisclosure } from '@/lib/state-disclosures';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const city = searchParams.get('city');
  const state = searchParams.get('state');
  const zip = searchParams.get('zip');

  if (!address || !city || !state || !zip) {
    return NextResponse.json(
      { error: 'Missing required parameters: address, city, state, zip' },
      { status: 400 }
    );
  }

  // Check state restrictions first
  const stateUpper = state.toUpperCase();
  const disclosure = getStateDisclosure(stateUpper);

  if (!isStateAllowed(stateUpper)) {
    return NextResponse.json({
      allowed: false,
      state_code: stateUpper,
      restriction: disclosure,
      error: `We currently cannot accept listings from ${disclosure?.state_name || state}. ${disclosure?.notes || ''}`,
    }, { status: 403 });
  }

  // Look up property estimate
  const estimate = await lookupPropertyEstimate(address, city, state, zip);

  if (!estimate) {
    // Return allowed status but no estimate — frontend will ask for manual entry
    return NextResponse.json({
      allowed: true,
      state_code: stateUpper,
      disclosure: disclosure,
      estimate: null,
      message: 'Property estimate not found. Please enter your home value manually.',
    });
  }

  const minPct = parseFloat(process.env.NEXT_PUBLIC_MIN_COMMISSION_PCT || '1.2');
  const minCommission = calculateMinCommission(estimate.estimated_value, minPct);

  return NextResponse.json({
    allowed: true,
    state_code: stateUpper,
    disclosure: disclosure,
    estimate,
    min_commission: minCommission,
  });
}
