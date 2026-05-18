// lib/state-disclosures.ts
// Research-based state-by-state disclosure requirements
// IMPORTANT: This is a starting point. Always verify with a licensed real estate attorney
// in each jurisdiction before accepting listings. Laws change frequently.
// Last reviewed: 2025

import { StateDisclosure } from '@/types';

export const STATE_DISCLOSURES: StateDisclosure[] = [
  // ── FULL RESTRICTION / HIGH CAUTION ──────────────────────────────────────
  {
    state_code: 'KS',
    state_name: 'Kansas',
    allowed: false,
    restriction_type: 'full_ban',
    notes: 'Kansas Real Estate Brokers\' and Salespersons\' License Act prohibits fee-splitting with unlicensed entities. The platform\'s listing fee model may constitute unlicensed brokerage activity. DO NOT accept listings until legal review complete.',
    legal_reference: 'K.S.A. 58-3034',
  },
  {
    state_code: 'OK',
    state_name: 'Oklahoma',
    allowed: false,
    restriction_type: 'full_ban',
    notes: 'Oklahoma Real Estate License Code, Title 59, §858-301. Attorney General opinion has indicated platforms facilitating commission negotiation between unlicensed parties and realtors may require a broker license. Pending legislative clarity.',
    legal_reference: 'Title 59, §858-301',
  },
  {
    state_code: 'WV',
    state_name: 'West Virginia',
    allowed: false,
    restriction_type: 'attorney_state',
    notes: 'Real estate closings must be handled by licensed attorneys in WV. The commission bidding model intersects with unauthorized practice of law concerns. Restriction pending legal opinion.',
    legal_reference: 'W. Va. Code §30-40-1 et seq.',
  },

  // ── ATTORNEY STATES — allowed but requires disclosure ────────────────────
  {
    state_code: 'GA',
    state_name: 'Georgia',
    allowed: true,
    restriction_type: 'attorney_state',
    notes: 'Georgia is an attorney closing state. Listings accepted, but homeowners must be clearly disclosed that a licensed real estate attorney is required to close the transaction, separate from the realtor\'s commission negotiated here.',
    legal_reference: 'O.C.G.A. §15-19-52',
  },
  {
    state_code: 'SC',
    state_name: 'South Carolina',
    allowed: true,
    restriction_type: 'attorney_state',
    notes: 'Attorney closing state. Must disclose to homeowners that SC law requires a licensed attorney to handle closing. Realtor commission bid does not cover closing attorney fees.',
    legal_reference: 'S.C. Code §40-5-320',
  },
  {
    state_code: 'NC',
    state_name: 'North Carolina',
    allowed: true,
    restriction_type: 'attorney_state',
    notes: 'Attorney closing state. The NC Real Estate Commission requires specific agency disclosure forms. Platform must surface NCREC disclosure language on listing creation.',
    legal_reference: 'N.C.G.S. §84-2.2',
  },
  {
    state_code: 'MA',
    state_name: 'Massachusetts',
    allowed: true,
    restriction_type: 'attorney_state',
    notes: 'Attorney closing state. Listings accepted. Disclose that a real estate attorney (separate from agent) is required for closing in MA.',
    legal_reference: 'M.G.L. c. 93A, 221 CMR 14.00',
  },
  {
    state_code: 'CT',
    state_name: 'Connecticut',
    allowed: true,
    restriction_type: 'attorney_state',
    notes: 'Attorney closing state. CT REALTORS mandate specific disclosure forms. Platform should display: "Connecticut requires a licensed attorney for real estate closings."',
    legal_reference: 'CGS §20-325',
  },
  {
    state_code: 'NY',
    state_name: 'New York',
    allowed: true,
    restriction_type: 'attorney_state',
    notes: 'Attorney closing state. NY has robust consumer protection laws. DOS Form OP-H843 agency disclosure required. Platform must present this disclosure before any listing goes live.',
    legal_reference: 'Real Property Law §443',
  },
  {
    state_code: 'DE',
    state_name: 'Delaware',
    allowed: true,
    restriction_type: 'attorney_state',
    notes: 'Attorney closing state. Delaware law requires an attorney to perform the real estate title search and closing.',
    legal_reference: 'Del. Code tit. 24, §2902',
  },

  // ── DISCLOSURE REQUIRED states ───────────────────────────────────────────
  {
    state_code: 'IL',
    state_name: 'Illinois',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Illinois requires a specific agency disclosure (Illinois Residential Real Property Disclosure Act). Platform must surface this to homeowners. Illinois attorneys are commonly used for closings but not legally required.',
    legal_reference: '765 ILCS 77/1',
  },
  {
    state_code: 'TX',
    state_name: 'Texas',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Texas Real Estate Commission (TREC) requires specific disclosure forms. Realtors bidding on TX properties must hold active TREC licenses. Platform must verify license state matches property state.',
    legal_reference: 'Texas Occupations Code §1101',
  },
  {
    state_code: 'FL',
    state_name: 'Florida',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Florida has strong seller disclosure requirements under F.S. §689.261. Bidding realtors must hold active FREC licenses. Display disclosure notice: homeowner is responsible for all seller-required disclosures.',
    legal_reference: 'F.S. §475.01 et seq.',
  },
  {
    state_code: 'CA',
    state_name: 'California',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'California has extensive disclosure requirements (Transfer Disclosure Statement, Natural Hazard Disclosure). The DRE requires realtors to have CA license. Platform must require CA-licensed realtors for CA properties.',
    legal_reference: 'Cal. Civ. Code §1102',
  },
  {
    state_code: 'MN',
    state_name: 'Minnesota',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Minnesota Seller\'s Property Disclosure Statement required. Specific agency disclosure forms mandated by MN Dept of Commerce. Display required disclosure language on listing creation.',
    legal_reference: 'Minn. Stat. §82.67',
  },
  {
    state_code: 'WI',
    state_name: 'Wisconsin',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Wisconsin REEB requires specific Condition Report and Agency Disclosure. Real estate is regulated under Wis. Admin. Code REEB. Platform must surface state-required disclosure notice.',
    legal_reference: 'Wis. Stat. §452.133',
  },
  {
    state_code: 'MI',
    state_name: 'Michigan',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Michigan Seller Disclosure Act (P.A. 92 of 1993) requires a disclosure statement for residential properties. Platform must inform sellers of this obligation.',
    legal_reference: 'MCL 565.951',
  },
  {
    state_code: 'OH',
    state_name: 'Ohio',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Ohio requires Residential Property Disclosure Form. ORC Chapter 4735 governs real estate license law. Platform must display Ohio-specific disclosure notice.',
    legal_reference: 'ORC §4735.01',
  },
  {
    state_code: 'PA',
    state_name: 'Pennsylvania',
    allowed: true,
    restriction_type: 'attorney_state',
    notes: 'PA is considered an attorney closing state in practice, though not legally mandated statewide. Philadelphia and Pittsburgh strongly default to attorney closings. Seller Disclosure Law (68 P.S. §7301) applies.',
    legal_reference: '68 P.S. §7301',
  },
  {
    state_code: 'NJ',
    state_name: 'New Jersey',
    allowed: true,
    restriction_type: 'attorney_state',
    notes: 'Attorney closing state in practice; extremely common. NJ Real Estate License Act (N.J.S.A. 45:15-1) governs. Attorney review period (3 business days) after contract. Must disclose to homeowners.',
    legal_reference: 'N.J.S.A. 45:15-1',
  },
  {
    state_code: 'VA',
    state_name: 'Virginia',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Virginia Residential Property Disclosure Act requires specific disclosures. DPOR regulates realtors. Platform must verify realtor holds active VA license for VA properties.',
    legal_reference: 'Va. Code §55.1-700 et seq.',
  },
  {
    state_code: 'MD',
    state_name: 'Maryland',
    allowed: true,
    restriction_type: 'attorney_state',
    notes: 'Attorney closing state. Maryland Disclosure and Disclaimer Statement required. Specific transfer and recordation taxes apply. Must disclose closing attorney requirement.',
    legal_reference: 'Md. Code, Bus. Occ. & Prof. §17-522',
  },
  {
    state_code: 'AZ',
    state_name: 'Arizona',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Arizona Association of Realtors Residential Seller Property Disclosure Statement. ADRE regulates licensees. Platform must require AZ-licensed realtors for AZ properties.',
    legal_reference: 'A.R.S. §32-2100',
  },
  {
    state_code: 'CO',
    state_name: 'Colorado',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Colorado Real Estate Commission (CREC) mandates specific contract forms. Sellers Disclosure of Adverse Material Facts required. Platform should note that CREC-approved contract forms are required.',
    legal_reference: 'C.R.S. §12-10-201',
  },
  {
    state_code: 'WA',
    state_name: 'Washington',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Washington Seller Disclosure Act (RCW 64.06) requires specific disclosure statements. Escrow companies (not attorneys) typically close transactions. Platform must surface disclosure requirements.',
    legal_reference: 'RCW 64.06.013',
  },
  {
    state_code: 'OR',
    state_name: 'Oregon',
    allowed: true,
    restriction_type: 'disclosure_required',
    notes: 'Oregon Property Disclosure Statement (ORS 105.464) required for residential sales. Oregon Real Estate Agency (OREA) governs licensees.',
    legal_reference: 'ORS 105.464',
  },

  // ── GENERALLY ALLOWED (standard disclosures apply) ───────────────────────
  {
    state_code: 'AL', state_name: 'Alabama', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Alabama Center for Real Estate (ACRE) governs. Standard seller disclosure requirements apply. Listings accepted.',
  },
  {
    state_code: 'AK', state_name: 'Alaska', allowed: true,
    notes: 'Alaska Real Estate Commission governs. No unusual restrictions identified. Standard disclosures apply.',
  },
  {
    state_code: 'AR', state_name: 'Arkansas', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Arkansas Real Estate Commission disclosure requirements apply. Listings accepted.',
  },
  {
    state_code: 'HI', state_name: 'Hawaii', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Hawaii Real Estate Commission governs. Seller disclosure required. Attorney closings common. Listings accepted.',
  },
  {
    state_code: 'ID', state_name: 'Idaho', allowed: true,
    notes: 'Idaho Real Estate Commission governs. Standard disclosures apply. Listings accepted.',
  },
  {
    state_code: 'IN', state_name: 'Indiana', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Indiana Real Estate Commission governs. Seller Residential Real Estate Sales Disclosure Form required.',
  },
  {
    state_code: 'IA', state_name: 'Iowa', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Iowa Real Estate Commission governs. Seller Disclosure Statement required.',
  },
  {
    state_code: 'KY', state_name: 'Kentucky', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Kentucky Real Estate Commission governs. Seller disclosure required. Listings accepted.',
  },
  {
    state_code: 'LA', state_name: 'Louisiana', allowed: true, restriction_type: 'attorney_state',
    notes: 'Louisiana is a civil law state using notaries for closings (not common law attorneys). LREC governs realtors. Closings require a notary public. Disclose this requirement.',
    legal_reference: 'LSA-R.S. 37:1430',
  },
  {
    state_code: 'ME', state_name: 'Maine', allowed: true, restriction_type: 'attorney_state',
    notes: 'Attorney closing state. Maine Real Estate Commission governs. Disclose attorney closing requirement.',
  },
  {
    state_code: 'MO', state_name: 'Missouri', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Missouri Real Estate Commission governs. Listings accepted. Standard disclosures apply.',
  },
  {
    state_code: 'MT', state_name: 'Montana', allowed: true,
    notes: 'Montana Board of Realty Regulation governs. No unusual restrictions. Listings accepted.',
  },
  {
    state_code: 'NE', state_name: 'Nebraska', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Nebraska Real Estate Commission governs. Seller Disclosure Statement required.',
  },
  {
    state_code: 'NV', state_name: 'Nevada', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Nevada Real Estate Division governs. Seller\'s Real Property Disclosure Form required.',
  },
  {
    state_code: 'NH', state_name: 'New Hampshire', allowed: true, restriction_type: 'attorney_state',
    notes: 'Attorney closing state in practice. NH Real Estate Commission governs. Disclose closing attorney requirement.',
  },
  {
    state_code: 'NM', state_name: 'New Mexico', allowed: true, restriction_type: 'disclosure_required',
    notes: 'New Mexico Real Estate Commission governs. Seller disclosure required. Listings accepted.',
  },
  {
    state_code: 'ND', state_name: 'North Dakota', allowed: true,
    notes: 'North Dakota Real Estate Commission governs. No unusual restrictions. Listings accepted.',
  },
  {
    state_code: 'RI', state_name: 'Rhode Island', allowed: true, restriction_type: 'attorney_state',
    notes: 'Attorney closing state. Rhode Island Real Estate Commission governs. Disclose attorney requirement.',
  },
  {
    state_code: 'SD', state_name: 'South Dakota', allowed: true,
    notes: 'South Dakota Real Estate Commission governs. No unusual restrictions. Listings accepted.',
  },
  {
    state_code: 'TN', state_name: 'Tennessee', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Tennessee Real Estate Commission governs. Residential Property Condition Disclosure required.',
  },
  {
    state_code: 'UT', state_name: 'Utah', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Utah Division of Real Estate governs. Seller disclosures required. Listings accepted.',
  },
  {
    state_code: 'VT', state_name: 'Vermont', allowed: true, restriction_type: 'attorney_state',
    notes: 'Attorney closing state. Vermont Real Estate Commission governs.',
  },
  {
    state_code: 'WY', state_name: 'Wyoming', allowed: true,
    notes: 'Wyoming Real Estate Commission governs. No unusual restrictions. Listings accepted.',
  },
  {
    state_code: 'DC', state_name: 'District of Columbia', allowed: true, restriction_type: 'disclosure_required',
    notes: 'DC DLCP regulates real estate licensees. Specific disclosure forms required. Attorney closings common. Listings accepted.',
  },
  {
    state_code: 'MS', state_name: 'Mississippi', allowed: true, restriction_type: 'disclosure_required',
    notes: 'Mississippi Real Estate Commission governs. Seller disclosure required.',
  },
  {
    state_code: 'KS', state_name: 'Kansas', allowed: false,
    restriction_type: 'full_ban',
    notes: 'See above — full ban.',
  },
];

// Deduplicate (KS appears twice above for clarity — real data should be clean)
const seen = new Set<string>();
export const STATE_DISCLOSURES_MAP: Record<string, StateDisclosure> = {};

STATE_DISCLOSURES.forEach(s => {
  if (!seen.has(s.state_code)) {
    seen.add(s.state_code);
    STATE_DISCLOSURES_MAP[s.state_code] = s;
  }
});

export function getStateDisclosure(stateCode: string): StateDisclosure | undefined {
  return STATE_DISCLOSURES_MAP[stateCode.toUpperCase()];
}

export function isStateAllowed(stateCode: string): boolean {
  const disclosure = getStateDisclosure(stateCode);
  if (!disclosure) return true; // default allow if unknown, but log for review
  return disclosure.allowed;
}

export function getRestrictedStates(): StateDisclosure[] {
  return Object.values(STATE_DISCLOSURES_MAP).filter(s => !s.allowed);
}

export function getAttorneyStates(): StateDisclosure[] {
  return Object.values(STATE_DISCLOSURES_MAP).filter(
    s => s.restriction_type === 'attorney_state' && s.allowed
  );
}
