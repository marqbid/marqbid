// lib/property-lookup.ts
// Bridge Interactive API integration for property estimates
// Bridge provides free API access for HUD-approved datasets
// Sign up: https://bridgeinteractive.com/developers/
// Fallback: ATTOM Data (freemium), or manual entry

import { PropertyEstimate } from '@/types';

const BRIDGE_TOKEN = process.env.BRIDGE_API_TOKEN;
const BRIDGE_BASE = process.env.BRIDGE_API_BASE || 'https://api.bridgedataoutput.com/api/v2';

// ATTOM Data fallback — also has a free tier
const ATTOM_KEY = process.env.ATTOM_API_KEY;
const ATTOM_BASE = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

/**
 * Main entry point — tries Bridge first, falls back to ATTOM, then returns null
 */
export async function lookupPropertyEstimate(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<PropertyEstimate | null> {
  // 1. Try Bridge Interactive
  if (BRIDGE_TOKEN) {
    try {
      const result = await lookupViaBridge(address, city, state, zip);
      if (result) return result;
    } catch (e) {
      console.error('[Bridge API] Error:', e);
    }
  }

  // 2. Try ATTOM Data
  if (ATTOM_KEY) {
    try {
      const result = await lookupViaAttom(address, city, state, zip);
      if (result) return result;
    } catch (e) {
      console.error('[ATTOM API] Error:', e);
    }
  }

  // 3. Return null — frontend will allow manual entry
  return null;
}

async function lookupViaBridge(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<PropertyEstimate | null> {
  // Bridge Interactive uses MLS-based data via RESO Web API standard
  // Endpoint: /reso/odata/Property
  const query = new URLSearchParams({
    access_token: BRIDGE_TOKEN!,
    $filter: `PostalCode eq '${zip}' and StreetName eq '${encodeAddressForBridge(address)}'`,
    $select: 'ListPrice,BedroomsTotal,BathroomsTotalInteger,LivingArea,YearBuilt,UnparsedAddress,City,StateOrProvince,PostalCode',
    $top: '1',
  });

  const url = `${BRIDGE_BASE}/reso/odata/Property?${query}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 }, // cache 1 hour
  });

  if (!res.ok) return null;

  const data = await res.json();
  const props = data?.value;
  if (!props || props.length === 0) return null;

  const prop = props[0];
  const estimatedValue = prop.ListPrice || prop.ClosePrice;
  if (!estimatedValue) return null;

  return {
    address: prop.UnparsedAddress || address,
    city: prop.City || city,
    state: prop.StateOrProvince || state,
    zip: prop.PostalCode || zip,
    estimated_value: estimatedValue,
    source: 'bridge',
    bedrooms: prop.BedroomsTotal,
    bathrooms: prop.BathroomsTotalInteger,
    sqft: prop.LivingArea,
    year_built: prop.YearBuilt,
    fetched_at: new Date().toISOString(),
  };
}

async function lookupViaAttom(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<PropertyEstimate | null> {
  // ATTOM AVM (Automated Valuation Model) endpoint
  const url = `${ATTOM_BASE}/avm/detail?address1=${encodeURIComponent(address)}&address2=${encodeURIComponent(`${city}, ${state} ${zip}`)}`;

  const res = await fetch(url, {
    headers: {
      'apikey': ATTOM_KEY!,
      'Accept': 'application/json',
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const prop = data?.property?.[0];
  if (!prop) return null;

  const avm = prop.avm;
  if (!avm?.amount?.value) return null;

  return {
    address: prop.address?.oneLine || address,
    city: prop.address?.locality || city,
    state: prop.address?.countrySubd || state,
    zip: prop.address?.postal1 || zip,
    estimated_value: avm.amount.value,
    source: 'attom',
    bedrooms: prop.building?.rooms?.beds,
    bathrooms: prop.building?.rooms?.bathsFull,
    sqft: prop.building?.size?.livingSize,
    year_built: prop.summary?.yearBuilt,
    fetched_at: new Date().toISOString(),
  };
}

function encodeAddressForBridge(address: string): string {
  // Extract street name from full address for Bridge query
  // e.g. "123 Maple Ridge Drive" -> "Maple Ridge"
  const parts = address.trim().split(' ');
  if (parts.length <= 2) return parts[parts.length - 1];
  return parts.slice(1, -1).join(' ');
}

/**
 * Calculate the minimum commission fee for a given reference price
 */
export function calculateMinCommission(
  referencePrice: number,
  minPct: number = parseFloat(process.env.NEXT_PUBLIC_MIN_COMMISSION_PCT || '1.2')
): { pct: number; usd: number } {
  return {
    pct: minPct,
    usd: Math.round((referencePrice * minPct) / 100),
  };
}

/**
 * Calculate commission USD from a percentage bid
 */
export function commissionPctToUsd(referencePrice: number, pct: number): number {
  return Math.round((referencePrice * pct) / 100);
}
