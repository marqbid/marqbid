// types/index.ts

export type UserRole = 'homeowner' | 'realtor' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  license_number?: string;   // realtors only
  brokerage?: string;        // realtors only
  license_state?: string;    // realtors only
  bio?: string;
  avg_rating?: number;
  total_sales?: number;
  created_at: string;
}

export type ListingStatus = 'draft' | 'active' | 'closed' | 'sold' | 'cancelled';

export interface Listing {
  id: string;
  owner_id: string;
  address: string;
  city: string;
  state: string;            // 2-letter state code
  zip: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  year_built?: number;
  description?: string;
  asking_price?: number;    // homeowner's target
  zestimate?: number;       // fetched from Bridge/public data
  reference_price: number;  // max(asking_price, zestimate) — used for floor calc
  min_commission_pct: number; // platform floor %, default 1.2
  min_commission_usd: number; // reference_price * min_commission_pct / 100
  status: ListingStatus;
  bid_deadline: string;     // ISO timestamp
  payment_confirmed: boolean;
  listing_fee_cents: number;
  photos?: string[];
  created_at: string;
  updated_at: string;
  // joined
  profile?: Profile;
  bids?: Bid[];
  bid_count?: number;
  lowest_bid_pct?: number;
}

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type BidType = 'percentage' | 'flat';

export interface Bid {
  id: string;
  listing_id: string;
  realtor_id: string;
  bid_type: BidType;
  commission_pct?: number;   // if percentage
  commission_usd: number;    // always stored as USD equivalent
  cover_letter?: string;
  status: BidStatus;
  created_at: string;
  updated_at: string;
  // joined
  profile?: Profile;
  listing?: Listing;
}

export interface StateDisclosure {
  state_code: string;
  state_name: string;
  allowed: boolean;          // can we accept listings?
  restriction_type?: 'full_ban' | 'attorney_state' | 'disclosure_required' | 'fee_restriction';
  notes?: string;
  legal_reference?: string;
}

export interface PropertyEstimate {
  address: string;
  city: string;
  state: string;
  zip: string;
  estimated_value: number;
  source: 'bridge' | 'attom' | 'fallback';
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  year_built?: number;
  fetched_at: string;
}
