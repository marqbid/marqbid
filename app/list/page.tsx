// app/list/page.tsx
'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import {
  MapPin, Home, DollarSign, Clock, AlertTriangle, CheckCircle,
  Shield, ChevronRight, Loader2, Info
} from 'lucide-react';

const PLATFORM_FEE = parseFloat(process.env.NEXT_PUBLIC_LISTING_FEE_CENTS || '999') / 100;
const MIN_PCT = parseFloat(process.env.NEXT_PUBLIC_MIN_COMMISSION_PCT || '1.2');

type Step = 'address' | 'details' | 'pricing' | 'payment' | 'confirm';

interface FormData {
  address: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  year_built: string;
  description: string;
  asking_price: string;
  bid_deadline_days: string;
}

interface LookupResult {
  allowed: boolean;
  estimate?: { estimated_value: number; source: string };
  min_commission?: { pct: number; usd: number };
  disclosure?: {
    restriction_type?: string;
    notes?: string;
  };
  error?: string;
}

export default function ListPage() {
  const [step, setStep] = useState<Step>('address');
  const [form, setForm] = useState<FormData>({
    address: '', city: '', state: '', zip: '',
    bedrooms: '', bathrooms: '', sqft: '', year_built: '',
    description: '', asking_price: '', bid_deadline_days: '7',
  });
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof FormData, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const referencePrice = Math.max(
    parseFloat(form.asking_price) || 0,
    lookup?.estimate?.estimated_value || 0
  );
  const minCommissionUsd = referencePrice > 0 ? Math.round(referencePrice * MIN_PCT / 100) : 0;

  async function lookupAddress() {
    if (!form.address || !form.city || !form.state || !form.zip) {
      setError('Please fill in all address fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        address: form.address, city: form.city,
        state: form.state, zip: form.zip,
      });
      const res = await fetch(`/api/property-lookup?${params}`);
      const data = await res.json();
      setLookup(data);
      if (!data.allowed) {
        setError(data.error || 'This state is currently unavailable.');
      } else {
        setStep('details');
      }
    } catch {
      setError('Could not look up this address. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const steps: { id: Step; label: string }[] = [
    { id: 'address', label: 'Address' },
    { id: 'details', label: 'Property details' },
    { id: 'pricing', label: 'Pricing & timing' },
    { id: 'payment', label: 'Pay & publish' },
  ];
  const stepIdx = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                i <= stepIdx ? 'text-brand-600' : 'text-gray-400'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  i < stepIdx ? 'bg-brand-400 text-white' :
                  i === stepIdx ? 'bg-brand-400 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {i < stepIdx ? <CheckCircle size={12} /> : i + 1}
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px ${i < stepIdx ? 'bg-brand-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Address */}
        {step === 'address' && (
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="text-brand-400" size={20} />
              <h2>Where is the property?</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Street address</label>
                <input
                  className="input"
                  placeholder="2847 Maple Ridge Drive"
                  value={form.address}
                  onChange={e => update('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">City</label>
                  <input className="input" placeholder="Denver" value={form.city}
                    onChange={e => update('city', e.target.value)} />
                </div>
                <div>
                  <label className="label">State</label>
                  <select className="input" value={form.state}
                    onChange={e => update('state', e.target.value)}>
                    <option value="">Select state</option>
                    {US_STATES.map(s => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="w-32">
                <label className="label">ZIP code</label>
                <input className="input" placeholder="80204" value={form.zip}
                  onChange={e => update('zip', e.target.value)} />
              </div>
            </div>

            {error && (
              <div className="disclosure-banner mt-4">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                <p className="text-amber-800 text-sm">{error}</p>
              </div>
            )}

            <button
              className="btn-primary mt-6 w-full justify-center py-3"
              onClick={lookupAddress}
              disabled={loading}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Looking up property...' : 'Continue'}
              {!loading && <ChevronRight size={16} />}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              We'll pull public property data to auto-fill details where available.
            </p>
          </div>
        )}

        {/* Step 2 — Property Details */}
        {step === 'details' && (
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Home className="text-brand-400" size={20} />
              <h2>Property details</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {form.address}, {form.city}, {form.state} {form.zip}
            </p>

            {lookup?.estimate && (
              <div className="badge-green mb-4 w-fit">
                <CheckCircle size={12} />
                Estimate found via {lookup.estimate.source} —
                ${lookup.estimate.estimated_value.toLocaleString()}
              </div>
            )}

            {lookup?.disclosure?.restriction_type === 'attorney_state' && (
              <div className="disclosure-banner mb-4">
                <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Attorney closing state:</strong> {lookup.disclosure.notes}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="label">Bedrooms</label>
                <input className="input" type="number" placeholder="4" value={form.bedrooms}
                  onChange={e => update('bedrooms', e.target.value)} />
              </div>
              <div>
                <label className="label">Bathrooms</label>
                <input className="input" type="number" step="0.5" placeholder="2.5" value={form.bathrooms}
                  onChange={e => update('bathrooms', e.target.value)} />
              </div>
              <div>
                <label className="label">Square footage</label>
                <input className="input" type="number" placeholder="2,180" value={form.sqft}
                  onChange={e => update('sqft', e.target.value)} />
              </div>
              <div>
                <label className="label">Year built</label>
                <input className="input" type="number" placeholder="1998" value={form.year_built}
                  onChange={e => update('year_built', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Description (optional)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Describe your home's highlights — recent updates, neighborhood, standout features…"
                value={form.description}
                onChange={e => update('description', e.target.value)}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn-outline" onClick={() => setStep('address')}>Back</button>
              <button className="btn-primary flex-1 justify-center" onClick={() => setStep('pricing')}>
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Pricing & Timing */}
        {step === 'pricing' && (
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="text-brand-400" size={20} />
              <h2>Pricing & bidding window</h2>
            </div>

            <div className="mb-4">
              <label className="label">Your target asking price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  className="input pl-7"
                  type="number"
                  placeholder={lookup?.estimate?.estimated_value
                    ? lookup.estimate.estimated_value.toLocaleString()
                    : '620,000'
                  }
                  value={form.asking_price}
                  onChange={e => update('asking_price', e.target.value)}
                />
              </div>
              {lookup?.estimate && (
                <p className="text-xs text-gray-400 mt-1">
                  Public estimate: ${lookup.estimate.estimated_value.toLocaleString()}.
                  We use whichever is higher as the commission reference.
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="label">Bidding window</label>
              <select
                className="input"
                value={form.bid_deadline_days}
                onChange={e => update('bid_deadline_days', e.target.value)}
              >
                {[3, 5, 7, 10, 14, 21, 30].map(d => (
                  <option key={d} value={d}>{d} days {d === 7 ? '(recommended)' : ''}</option>
                ))}
              </select>
            </div>

            {/* Minimum commission explainer */}
            {referencePrice > 0 && (
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6">
                <div className="text-sm font-medium text-brand-800 mb-2">
                  <Shield size={14} className="inline mr-1" />
                  Minimum commission floor for your listing
                </div>
                <div className="text-2xl font-bold text-brand-600">
                  ${minCommissionUsd.toLocaleString()}
                </div>
                <div className="text-xs text-brand-700 mt-1">
                  {MIN_PCT}% of ${referencePrice.toLocaleString()} reference price.
                  Realtors cannot bid below this amount.
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[
                    { label: 'Standard 3%', val: Math.round(referencePrice * 3 / 100) },
                    { label: 'Standard 2.5%', val: Math.round(referencePrice * 2.5 / 100) },
                    { label: 'Your floor', val: minCommissionUsd },
                  ].map(item => (
                    <div key={item.label} className="bg-white rounded-lg p-2 text-center">
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className="text-sm font-semibold text-gray-800">${item.val.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button className="btn-outline" onClick={() => setStep('details')}>Back</button>
              <button
                className="btn-primary flex-1 justify-center"
                onClick={() => setStep('payment')}
                disabled={!form.asking_price && !lookup?.estimate}
              >
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Payment */}
        {step === 'payment' && (
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-brand-400" size={20} />
              <h2>Review & pay to publish</h2>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Property</span>
                <span className="font-medium">{form.address}, {form.city}, {form.state}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reference price</span>
                <span className="font-medium">${referencePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Min commission floor</span>
                <span className="font-medium text-brand-600">${minCommissionUsd.toLocaleString()} ({MIN_PCT}%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bidding window</span>
                <span className="font-medium">{form.bid_deadline_days} days</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span>Listing fee</span>
                <span>${PLATFORM_FEE.toFixed(2)}</span>
              </div>
            </div>

            <div className="disclosure-banner mb-6">
              <Shield size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Important:</strong> MarqBid is not a licensed real estate broker.
                By publishing this listing, you confirm you understand the commission bidding process
                and will independently verify your selected realtor's license with your state's
                real estate commission.
              </div>
            </div>

            <button
              className="btn-primary w-full justify-center py-3 text-base mb-3"
              onClick={() => {
                // In real implementation: redirect to Stripe checkout
                alert('Stripe payment integration needed. Set STRIPE_SECRET_KEY in .env.local');
              }}
            >
              Pay ${PLATFORM_FEE.toFixed(2)} & publish listing
            </button>

            <p className="text-xs text-gray-400 text-center">
              Secure payment via Stripe. Your listing goes live immediately after payment.
            </p>

            <button className="btn-ghost w-full justify-center mt-2" onClick={() => setStep('pricing')}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'D.C.' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];
