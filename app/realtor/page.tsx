// app/realtor/page.tsx
'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import {
  Bed, Bath, Ruler, Clock, DollarSign, Star, TrendingDown,
  MapPin, Shield, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Listing } from '@/types';

const MIN_PCT = parseFloat(process.env.NEXT_PUBLIC_MIN_COMMISSION_PCT || '1.2');

export default function RealtorPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBidId, setActiveBidId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/listings')
      .then(r => r.json())
      .then(d => setListings(d.listings || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <div className="badge-green mb-3 w-fit">For licensed realtors</div>
          <h1 className="text-2xl font-semibold mb-2">Open listings — place your bids</h1>
          <p className="text-gray-500 text-sm">
            Homeowners are actively looking for an agent. Submit a competitive bid to win their listing.
            No monthly fees — you only pay a platform fee when your bid is accepted.
          </p>
        </div>

        {/* How bidding works for realtors */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <TrendingDown size={18} className="text-brand-400" />, title: 'Bid your commission', desc: 'Submit a % or flat fee. The homeowner sees your bid, rating, and cover letter.' },
            { icon: <Star size={18} className="text-brand-400" />, title: 'Stand out', desc: 'Write a compelling cover letter. Homeowners weigh price AND experience.' },
            { icon: <CheckCircle size={18} className="text-brand-400" />, title: 'Win & list', desc: 'If accepted, connect directly with the homeowner to finalize the listing agreement.' },
          ].map(item => (
            <div key={item.title} className="card flex gap-3">
              <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
              <div>
                <div className="text-sm font-medium text-gray-800 mb-1">{item.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-28 bg-gray-100 rounded-lg mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MapPin size={32} className="mx-auto mb-3 opacity-30" />
            <p>No open listings right now</p>
            <p className="text-sm mt-1">Check back soon — new listings are posted daily.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {listings.map(listing => (
              <RealtorListingCard
                key={listing.id}
                listing={listing}
                bidOpen={activeBidId === listing.id}
                onToggleBid={() => setActiveBidId(
                  activeBidId === listing.id ? null : listing.id
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RealtorListingCard({
  listing, bidOpen, onToggleBid
}: {
  listing: Listing;
  bidOpen: boolean;
  onToggleBid: () => void;
}) {
  const [bidType, setBidType] = useState<'percentage' | 'flat'>('percentage');
  const [commissionPct, setCommissionPct] = useState('');
  const [commissionFlat, setCommissionFlat] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const refPrice = listing.reference_price;
  const enteredPct = parseFloat(commissionPct);
  const previewUsd = !isNaN(enteredPct) && enteredPct > 0
    ? Math.round(refPrice * enteredPct / 100)
    : 0;

  const daysLeft = formatDistanceToNow(new Date(listing.bid_deadline), { addSuffix: true });
  const isUrgent = new Date(listing.bid_deadline).getTime() - Date.now() < 48 * 3600 * 1000;

  async function submitBid() {
    setError('');
    if (bidType === 'percentage' && !commissionPct) {
      setError('Enter a commission percentage.');
      return;
    }
    if (bidType === 'flat' && !commissionFlat) {
      setError('Enter a flat commission amount.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          bid_type: bidType,
          commission_pct: bidType === 'percentage' ? parseFloat(commissionPct) : undefined,
          commission_usd_flat: bidType === 'flat' ? parseFloat(commissionFlat) : undefined,
          cover_letter: coverLetter,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit bid.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`card transition-shadow ${bidOpen ? 'shadow-md ring-1 ring-brand-200' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-medium text-gray-900 text-sm">{listing.address}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={11} />
            {listing.city}, {listing.state} {listing.zip}
          </div>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          isUrgent ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'
        }`}>
          {isUrgent ? '⚡ Closes soon' : 'Open'}
        </div>
      </div>

      {/* Price & details */}
      <div className="text-xl font-bold text-brand-600 mb-2">
        ${refPrice.toLocaleString()}
        <span className="text-xs font-normal text-gray-400 ml-1">reference</span>
      </div>

      <div className="flex gap-3 text-xs text-gray-500 mb-3">
        {listing.bedrooms && <span className="flex items-center gap-1"><Bed size={11} />{listing.bedrooms} bed</span>}
        {listing.bathrooms && <span className="flex items-center gap-1"><Bath size={11} />{listing.bathrooms} bath</span>}
        {listing.sqft && <span className="flex items-center gap-1"><Ruler size={11} />{listing.sqft?.toLocaleString()} sqft</span>}
      </div>

      <div className="flex items-center justify-between text-xs mb-4">
        <span className="text-gray-500 flex items-center gap-1">
          <Clock size={11} /> Closes {daysLeft}
        </span>
        <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md font-medium">
          Floor: ${listing.min_commission_usd.toLocaleString()} ({listing.min_commission_pct}%)
        </span>
      </div>

      {listing.description && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{listing.description}</p>
      )}

      {/* Bid form toggle */}
      {submitted ? (
        <div className="bg-brand-50 rounded-xl p-4 flex items-center gap-2 text-sm text-brand-700">
          <CheckCircle size={16} />
          Bid submitted! You'll be notified if the homeowner accepts.
        </div>
      ) : (
        <>
          <button
            onClick={onToggleBid}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              bidOpen
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-brand-400 text-white hover:bg-brand-600'
            }`}
          >
            {bidOpen ? (
              <><ChevronUp size={15} /> Hide bid form</>
            ) : (
              <><TrendingDown size={15} /> Place a bid</>
            )}
          </button>

          {bidOpen && (
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              {/* Bid type selector */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {(['percentage', 'flat'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setBidType(type)}
                    className={`flex-1 py-2 text-xs font-medium transition-colors ${
                      bidType === type
                        ? 'bg-brand-400 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {type === 'percentage' ? '% of sale price' : 'Flat dollar amount'}
                  </button>
                ))}
              </div>

              {bidType === 'percentage' ? (
                <div>
                  <label className="label">Commission percentage</label>
                  <div className="relative">
                    <input
                      className="input pr-7"
                      type="number"
                      step="0.1"
                      min={MIN_PCT}
                      placeholder={`Min ${MIN_PCT}%`}
                      value={commissionPct}
                      onChange={e => setCommissionPct(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                  {previewUsd > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      = <strong>${previewUsd.toLocaleString()}</strong> on this home
                      {previewUsd < listing.min_commission_usd && (
                        <span className="text-red-500 ml-1">
                          ⚠ Below floor (${listing.min_commission_usd.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="label">Flat commission ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      className="input pl-6"
                      type="number"
                      min={listing.min_commission_usd}
                      placeholder={listing.min_commission_usd.toLocaleString()}
                      value={commissionFlat}
                      onChange={e => setCommissionFlat(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum: ${listing.min_commission_usd.toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <label className="label">Cover letter <span className="text-gray-400 normal-case font-normal">(strongly recommended)</span></label>
                <textarea
                  className="input text-sm"
                  rows={3}
                  placeholder="Tell the homeowner why you're the right fit — recent local sales, marketing approach, timeline, what you bring beyond the commission rate…"
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-3">
                  <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                <Shield size={12} className="inline mr-1 text-brand-400" />
                Your bid is binding if accepted. By submitting, you confirm you hold an active
                real estate license in <strong>{listing.state}</strong>.
              </div>

              <button
                onClick={submitBid}
                disabled={submitting}
                className="btn-primary w-full justify-center py-2.5"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <DollarSign size={15} />}
                {submitting ? 'Submitting…' : 'Submit bid'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
